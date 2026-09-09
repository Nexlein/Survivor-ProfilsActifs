import { getEighteenYearsAgo } from '../utils/date';
import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { ProviderFactory } from '../providers/ProviderFactory';

async function serializeProfileVideos(profile: any) {
    if (!profile || !profile.videos) return profile;
    const provider = ProviderFactory.getProvider();
    profile.videos = await Promise.all(profile.videos.map(async (v: any) => ({
        ...v,
        url: await provider.playbackUrl(v.providerId),
        subtitleUrl: await provider.subtitleUrl(v.providerId)
    })));
    return profile;
}

import fs from 'fs';
import path from 'path';
import { ProviderFactory } from '../providers/ProviderFactory';
import { deletePhysicalProfileFiles } from '../utils/profileFiles';
import { getEnvInt } from '../utils/env';

/**
 * Controller: Get profile of the current user
 * @route GET /api/profile
 * @access Private
 */
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.body?.user;
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        let profile = await prisma.profile.findUnique({
            where: { userId: user.id },
            include: { skills: true, videos: true }
        });
        profile = await serializeProfileVideos(profile);
        return res.json(profile);
    } catch (error) {
        return next(error);
    }
};

/**
 * Controller: Update profile of the current user
 * @route PUT /api/profile
 * @access Private
 */
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.body?.user;
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { fullName, targetSector, location, bio, companyName, industry, position, skills, visible, dateOfBirth } = req.body;

        if (skills && Array.isArray(skills) && skills.length > 10) {
            return res.status(400).json({ error: 'Maximum 10 skills allowed' });
        }

        const updateData: any = {};
        if (fullName !== undefined) updateData.fullName = fullName;
        if (targetSector !== undefined) updateData.targetSector = targetSector;
        if (location !== undefined) updateData.location = location;
        if (bio !== undefined) updateData.bio = bio;
        if (visible !== undefined) updateData.visible = visible === true || visible === 'true';

        if (user.role === 'RECRUITER') {
            if (companyName !== undefined) updateData.companyName = companyName;
            if (industry !== undefined) updateData.industry = industry;
            if (position !== undefined) updateData.position = position;
        }

        const skillsConnectOrCreate = skills && Array.isArray(skills)
            ? skills.map((skillName: string) => ({
                where: { name: skillName },
                create: { name: skillName }
            }))
            : undefined;

        if (skillsConnectOrCreate) {
            // `set: []` first so re-saving a shorter list actually drops the
            // removed skills instead of only ever adding new ones — only valid
            // on the update branch below, a nested `create` has no existing
            // relations to clear.
            updateData.skills = { set: [], connectOrCreate: skillsConnectOrCreate };
        }

        const profile = await prisma.profile.upsert({
            where: { userId: user.id },
            update: updateData,
            create: {
                userId: user.id,
                fullName: fullName || 'Utilisateur',
                targetSector,
                location,
                bio,
                ...(user.role === 'RECRUITER' ? { companyName, industry, position } : {}),
                ...(skillsConnectOrCreate ? { skills: { connectOrCreate: skillsConnectOrCreate } } : {})
            },
            include: { skills: true }
        });
        return res.json(profile);
    } catch (error) {
        return next(error);
    }
};

/**
 * Controller: Delete user profile
 * @route DELETE /api/profile
 * @access Private
 */
export const deleteProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.body?.user;
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const existing = await prisma.profile.findUnique({
            where: { userId: user.id },
            include: { videos: { select: { providerId: true } } },
        });
        if (!existing) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        // Physically delete media files (videos + avatar) before dropping the
        // row, same cleanup as the /compliance/account deletion path.
        const provider = ProviderFactory.getProvider();
        await deletePhysicalProfileFiles(existing, provider);

        const profile = await prisma.profile.delete({ where: { userId: user.id } });
        return res.json(profile);
    } catch (error) {
        return next(error);
    }
};

/**
 * Controller: Consult current profile
 * @route GET /api/profile/me
 * @access Private
 */
export const getCurrentProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.body?.user;
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        let profile = await prisma.profile.findUnique({
            where: { userId: user.id },
            include: { skills: true, videos: true }
        });
        profile = await serializeProfileVideos(profile);
        return res.json(profile);
    } catch (error) {
        return next(error);
    }
};

/**
 * Controller: Get all profiles
 * @route Get /api/profiles/all
 * @access Public — the candidate catalog is browsable without an account;
 * only profiles of minors are restricted to authenticated recruiters
 * (docs/mails/mesures_conservatoires.md).
 */
// Query params that would let a client filter/sort candidates by popularity
// (likes/views) are rejected on purpose: ranking profiles by engagement
// metrics introduces a bias risk in a recruitment catalog, so this isn't a
// missing feature to add later — it's an intentional restriction.
const FORBIDDEN_POPULARITY_QUERY_PARAMS = [
    'likes', 'minLikes', 'maxLikes', 'likeCount',
    'views', 'minViews', 'maxViews', 'viewCount',
    'sortBy', 'orderBy',
];

export const getAllProfiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const usedForbiddenParam = FORBIDDEN_POPULARITY_QUERY_PARAMS.find(
            (param) => req.query[param] !== undefined
        );
        if (usedForbiddenParam) {
            return res.status(400).json({
                error: `Filtering or sorting profiles by "${usedForbiddenParam}" is not supported.`
            });
        }

        // Auth is optional here (public catalog) — the optionalAuthenticateToken
        // middleware on this route already populates req.user when a valid
        // token is present, and leaves it undefined otherwise.
        const user: any = (req as any).user ?? null;

        const eighteenYearsAgo = getEighteenYearsAgo();

        const whereClause: any = {
            visible: true,
            // Admin moderation gate: candidates start PENDING at registration
            // and only enter the public catalog once approved.
            user: { dateOfBirth: { not: null }, moderationStatus: 'APPROVED' }
        };

        if (!user || user.role !== 'RECRUITER') {
            whereClause.user.dateOfBirth = { lte: eighteenYearsAgo };
        }

        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const pageSize = getEnvInt('FEED_PAGE_SIZE', 20);
        const skip = (page - 1) * pageSize;

        const [profiles, total] = await Promise.all([
            prisma.profile.findMany({
                where: whereClause,
                take: pageSize,
                skip,
                orderBy: [
                    { updatedAt: 'desc' },
                    { id: 'asc' }
                ],
                include: {
                    skills: true,
                    videos: {
                        where: { status: 'APPROVED' }, // Only show approved videos
                        select: {
                            id: true,
                            type: true,
                            providerId: true,
                            providerName: true,
                            createdAt: true,
                        }
                    }
                }
            }),
            prisma.profile.count({ where: whereClause }),
        ]);

        // A page past the end isn't an error — findMany/count already return
        // an empty result set cleanly, no bounds-check needed to avoid a crash.
        const profilesWithUrls = await Promise.all(profiles.map(serializeProfileVideos));
        return res.json({ profiles: profilesWithUrls, total, page, pageSize });
    } catch (error) {
        return next(error);
    }
};

/**
 * Controller: Get profile by user ID
 * @route Get /api/profiles/user/:id
 * @access Public (with constraints)
 */
export const getProfileByUserId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Auth is optional here — the optionalAuthenticateToken middleware on
        // this route already populates req.user when a valid token is
        // present, and leaves it undefined otherwise.
        const currentUser: any = (req as any).user ?? null;

        const profile = await prisma.profile.findUnique({
            where: { userId: req.params.id as string },
            include: {
                // Only the two fields actually used below (age/moderation
                // gating) — never load passwordHash into memory at all,
                // rather than fetch the full User row and strip it after.
                user: { select: { dateOfBirth: true, moderationStatus: true } },
                skills: true,
                videos: {
                    select: {
                        id: true,
                        type: true,
                        providerId: true,
                        providerName: true,
                        status: true,
                        rejectionReason: true,
                        createdAt: true,
                    }
                }
            }
        });


        if (!profile) return res.status(404).json({ error: 'Not found' });

        const isOwner = currentUser && currentUser.id === profile.userId;
        const isAdmin = currentUser?.role === 'ADMIN';

        // A PENDING/REJECTED video isn't public yet — only its owner (to see
        // moderation status) or an admin (to moderate it) should see it here.
        if (!isOwner && !isAdmin) {
            profile.videos = profile.videos.filter((v) => v.status === 'APPROVED');
        }

        // RGPD: Missing Age or Explicitly Hidden (Ticket 16)
        if (!isOwner) {
            if (profile.visible === false) {
                return res.status(410).json({ error: 'Ce profil a été retiré et n\'est plus disponible.' });
            }
            if (profile.user.dateOfBirth === null) {
                return res.status(403).json({ error: 'Access denied: Profile owner has not verified their age' });
            }
            // Admins bypass the moderation gate — they need to see PENDING
            // profiles in order to review and moderate them.
            if (!isAdmin && profile.user.moderationStatus !== 'APPROVED') {
                return res.status(403).json({ error: 'Access denied: Profile is pending moderation' });
            }
        }

        // RGPD MINORS CHECK
        if (profile.user.dateOfBirth) {
            const eighteenYearsAgo = getEighteenYearsAgo();
            const isMinor = profile.user.dateOfBirth > eighteenYearsAgo;

            if (isMinor) {
                if (!currentUser || currentUser.role !== 'RECRUITER') {
                    return res.status(403).json({ error: 'Access denied: Profile of minor is protected' });
                }
            }
        }

        let profileWithUrl = await serializeProfileVideos(profile);
        const { user: _, ...publicProfile } = profileWithUrl;
        return res.json(publicProfile);
    } catch (error) {
        return next(error);
    }
};
/**
 * Controller: Upload / replace the current user's profile photo
 * @route POST /profile/avatar
 * @access Private
 */
export const uploadProfileAvatar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // req.body.user (set by authenticateToken) doesn't survive here: multer
        // parses the multipart body *after* auth runs and replaces req.body
        // wholesale, wiping that property. req.user is set independently by
        // the same middleware and isn't affected, so read from there instead.
        const user = (req as any).user;
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const existing = await prisma.profile.findUnique({ where: { userId: user.id } });
        const avatarUrl = `/uploads/avatars/${file.filename}`;

        const profile = await prisma.profile.upsert({
            where: { userId: user.id },
            update: { avatarUrl },
            create: { userId: user.id, fullName: 'Utilisateur', avatarUrl },
        });

        // Best-effort cleanup of the previous locally-stored avatar file — an
        // external URL (e.g. seeded demo photos) is left alone since it isn't
        // a file we own on disk.
        if (existing?.avatarUrl?.startsWith('/uploads/avatars/')) {
            const oldPath = path.resolve(__dirname, '../..', existing.avatarUrl.replace(/^\//, ''));
            fs.unlink(oldPath, () => { });
        }

        return res.json(profile);
    } catch (error) {
        return next(error);
    }
};
