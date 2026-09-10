import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';

const CONTACT_MIN_LENGTH = 50;
const WEEKLY_SIGNUP_BUCKETS = 7;
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

/**
 * Controller: Log a recruiter interaction on a candidate profile
 * @route POST /api/interaction
 * @access Private (RECRUITER)
 *
 * FAVORITE is a toggle (one active record per recruiter+profile): a second
 * call removes the existing one instead of stacking duplicates. VIEW/CONTACT
 * are logs: every call creates a new row. LIKE is rejected outright — it's
 * an engagement-metric affordance the cabinet's contract explicitly bans.
 */
export const createInteraction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.body?.user;
        if (!user || user.role !== 'RECRUITER') {
            return res.status(403).json({ error: 'Forbidden. Recruiter role required.' });
        }

        const { profileId, type, videoId, subject, message } = req.body;

        if (type === 'LIKE') {
            return res.status(400).json({ error: 'LIKE is not supported.' });
        }

        const validTypes = ['VIEW', 'CONTACT', 'FAVORITE'];
        if (!profileId || !validTypes.includes(type)) {
            return res.status(400).json({ error: 'profileId and a valid type are required' });
        }

        const profile = await prisma.profile.findUnique({ where: { id: profileId } });
        if (!profile) return res.status(404).json({ error: 'Profile not found' });

        if (type === 'CONTACT') {
            if (!subject || subject.trim().length === 0) {
                return res.status(400).json({ error: 'A subject is required for CONTACT.' });
            }
            if (!message || message.trim().length < CONTACT_MIN_LENGTH) {
                return res.status(400).json({ error: `A message of at least ${CONTACT_MIN_LENGTH} characters is required for CONTACT.` });
            }
        }

        if (type === 'FAVORITE') {
            const existing = await prisma.interaction.findFirst({
                where: { recruiterId: user.id, profileId, type },
            });
            if (existing) {
                await prisma.interaction.delete({ where: { id: existing.id } });
                return res.status(200).json({ active: false });
            }
            const created = await prisma.interaction.create({
                data: { recruiterId: user.id, profileId, type },
            });
            return res.status(201).json({ active: true, interaction: created });
        }

        const interaction = await prisma.interaction.create({
            data: {
                recruiterId: user.id,
                profileId,
                videoId: videoId || null,
                type,
                subject: type === 'CONTACT' ? subject.trim() : null,
                message: type === 'CONTACT' ? message.trim() : null,
            },
        });

        return res.status(201).json(interaction);
    } catch (error) {
        return next(error);
    }
};

/**
 * Controller: List interactions received on the current user's own profile
 * @route GET /api/interaction/notifications
 * @access Private (candidate)
 */
export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.body?.user;
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
        if (!profile) return res.status(200).json([]);

        const notifications = await prisma.interaction.findMany({
            where: { profileId: profile.id, type: { in: ['VIEW', 'CONTACT', 'FAVORITE'] } },
            orderBy: { createdAt: 'desc' },
            include: {
                recruiter: {
                    select: { id: true, profile: { select: { fullName: true, companyName: true } } },
                },
            },
        });

        return res.status(200).json(notifications);
    } catch (error) {
        return next(error);
    }
};

/**
 * Controller: List CONTACT messages the current recruiter has sent
 * @route GET /api/interaction/sent
 * @access Private (RECRUITER)
 */
export const getSentContacts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.body?.user;
        if (!user || user.role !== 'RECRUITER') {
            return res.status(403).json({ error: 'Forbidden. Recruiter role required.' });
        }

        const contacts = await prisma.interaction.findMany({
            where: { recruiterId: user.id, type: 'CONTACT' },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                subject: true,
                message: true,
                read: true, // candidate-side "seen" state — surfaced to the recruiter as a response-status proxy
                createdAt: true,
                profile: {
                    select: { userId: true, fullName: true, visible: true, targetSector: true, certificationScore: true, hasCertificationBadge: true },
                },
            },
        });

        return res.status(200).json(contacts);
    } catch (error) {
        return next(error);
    }
};

/**
 * Controller: Mark one received notification as read
 * @route PUT /api/interaction/:id/read
 * @access Private (candidate, owner only)
 */
export const markNotificationRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.body?.user;
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
        if (!profile) return res.status(404).json({ error: 'Profile not found' });

        const id = req.params.id as string;
        const interaction = await prisma.interaction.findUnique({ where: { id } });
        if (!interaction) return res.status(404).json({ error: 'Interaction not found' });
        if (interaction.profileId !== profile.id) {
            return res.status(403).json({ error: 'You do not have permission to update this notification' });
        }

        const updated = await prisma.interaction.update({ where: { id }, data: { read: true } });
        return res.status(200).json(updated);
    } catch (error) {
        return next(error);
    }
};

/**
 * Controller: Interaction-derived stats for the recruiter/admin dashboards
 * @route GET /api/interaction/stats
 * @access Private (RECRUITER, ADMIN)
 */
export const getInteractionStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.body?.user;
        if (!user || (user.role !== 'RECRUITER' && user.role !== 'ADMIN')) {
            return res.status(403).json({ error: 'Forbidden.' });
        }

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        if (user.role === 'ADMIN') {
            // Bundled with the interaction count so the admin dashboard can
            // fetch every KPI it needs in one request — these aren't
            // Interaction-model stats, but platform-wide counts the
            // dashboard was previously showing as static placeholder data.
            const [interactionsThisMonth, profilesActive, certifiedProfiles, totalProfiles, videosPublished, videosPending] = await Promise.all([
                prisma.interaction.count({ where: { createdAt: { gte: startOfMonth } } }),
                prisma.profile.count({ where: { visible: true, user: { moderationStatus: 'APPROVED' } } }),
                prisma.profile.count({ where: { hasCertificationBadge: true } }),
                prisma.profile.count(),
                prisma.video.count({ where: { status: 'APPROVED' } }),
                prisma.video.count({ where: { status: 'PENDING' } }),
            ]);
            const certificationRate = totalProfiles > 0 ? Math.round((certifiedProfiles / totalProfiles) * 100) : 0;

            const now = new Date();
            const weeklySignups = await Promise.all(
                Array.from({ length: WEEKLY_SIGNUP_BUCKETS }, (_, i) => {
                    const bucketsAgo = WEEKLY_SIGNUP_BUCKETS - 1 - i;
                    const weekStart = new Date(now.getTime() - (bucketsAgo + 1) * MS_PER_WEEK);
                    const weekEnd = new Date(now.getTime() - bucketsAgo * MS_PER_WEEK);
                    return prisma.user.count({ where: { createdAt: { gte: weekStart, lt: weekEnd } } })
                        .then((count) => ({ weekStart: weekStart.toISOString(), count }));
                })
            );

            return res.status(200).json({
                interactionsThisMonth,
                profilesActive,
                certificationRate,
                videosPublished,
                videosPending,
                weeklySignups,
            });
        }

        const [profilesViewed, favorites, messagesSent] = await Promise.all([
            prisma.interaction.count({
                where: { recruiterId: user.id, type: 'VIEW', createdAt: { gte: startOfMonth } },
            }),
            prisma.interaction.count({
                where: { recruiterId: user.id, type: 'FAVORITE' },
            }),
            prisma.interaction.count({
                where: { recruiterId: user.id, type: 'CONTACT', createdAt: { gte: startOfMonth } },
            }),
        ]);

        return res.status(200).json({ profilesViewed, favorites, messagesSent });
    } catch (error) {
        return next(error);
    }
};
