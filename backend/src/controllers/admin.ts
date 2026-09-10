import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';

const VALID_MODERATION_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'];

/**
 * Controller: List candidate accounts by moderation status
 * @route GET /admin/moderation/queue
 * @access Private (ADMIN)
 *
 * Defaults to PENDING (the original behavior) — pass ?status=APPROVED to
 * find accounts eligible for a ban, or REJECTED/SUSPENDED to find ones
 * eligible for reactivation. Scoped to JOB_SEEKER: RECRUITER/ADMIN accounts
 * are always APPROVED and were never meant to appear in this queue.
 */
export const getModerationQueue = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const requestedStatus = (req.query.status as string || 'PENDING').toUpperCase();
        const status = VALID_MODERATION_STATUSES.includes(requestedStatus) ? requestedStatus : 'PENDING';

        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const pageSize = 20;
        const skip = (page - 1) * pageSize;

        const where = { moderationStatus: status as any, role: 'JOB_SEEKER' as const };

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                take: pageSize,
                skip,
                orderBy: { createdAt: 'asc' },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    moderationStatus: true,
                    profile: { select: { fullName: true, avatarUrl: true } },
                },
            }),
            prisma.user.count({ where }),
        ]);

        return res.status(200).json({ users, total, page, pageSize });
    } catch (error) {
        return next(error);
    }
};

const setModerationStatus = (status: 'APPROVED' | 'REJECTED' | 'SUSPENDED') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.params.userId as string;

            const existing = await prisma.user.findUnique({ where: { id: userId } });
            if (!existing) return res.status(404).json({ error: 'User not found' });

            const updated = await prisma.user.update({
                where: { id: userId },
                data: { moderationStatus: status },
                select: { id: true, email: true, role: true, moderationStatus: true },
            });

            return res.status(200).json(updated);
        } catch (error) {
            return next(error);
        }
    };
};

/**
 * Controller: Approve a pending account
 * @route PATCH /admin/moderation/:userId/approve
 * @access Private (ADMIN)
 */
export const approveModeration = setModerationStatus('APPROVED');

/**
 * Controller: Reject a pending account
 * @route PATCH /admin/moderation/:userId/reject
 * @access Private (ADMIN)
 */
export const rejectModeration = setModerationStatus('REJECTED');

/**
 * Controller: Suspend an account (including a previously-approved one)
 * @route PATCH /admin/moderation/:userId/suspend
 * @access Private (ADMIN)
 */
export const suspendModeration = setModerationStatus('SUSPENDED');

/**
 * Controller: Hide a specific profile from the public catalog
 * @route POST /admin/profiles/:id/hide
 * @access Private (ADMIN)
 *
 * Distinct from suspend: this flips Profile.visible (the same field the
 * owner can already toggle themselves via PUT /profile) without touching
 * the account's moderationStatus — the account stays APPROVED, only this
 * one profile stops appearing in the catalog.
 */
export const hideProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;

        const existing = await prisma.profile.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ error: 'Profile not found' });

        const updated = await prisma.profile.update({
            where: { id },
            data: { visible: false },
            select: { id: true, fullName: true, visible: true },
        });

        return res.status(200).json(updated);
    } catch (error) {
        return next(error);
    }
};
