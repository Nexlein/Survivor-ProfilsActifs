import { getEighteenYearsAgo } from '../utils/date';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import fs from 'fs';
import path from 'path';

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
        const profile = await prisma.profile.findUnique({
            where: { userId: user.id },
            include: { skills: true, videos: true }
        });
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
        const profile = await prisma.profile.findUnique({
            where: { userId: user.id },
            include: { skills: true, videos: true }
        });
        return res.json(profile);
    } catch (error) {
        return next(error);
    }
};

/**
 * Controller: Get all profiles
 * @route Get /api/profiles/all
 * @access Private
 */
export const getAllProfiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.body?.user;
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const eighteenYearsAgo = getEighteenYearsAgo();

        const whereClause: any = {
            visible: true,
            user: { dateOfBirth: { not: null } }
        };

        if (user.role !== 'RECRUITER') {
            whereClause.user.dateOfBirth = { lte: eighteenYearsAgo };
        }

        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const take = 20;
        const skip = (page - 1) * take;

        const profiles = await prisma.profile.findMany({
            where: whereClause,
            take,
            skip,
            include: {
                skills: true,
                videos: {
                    where: { status: 'APPROVED' }, // Only show approved videos
                    select: {
                        id: true,
                        type: true,
                        url: true,
                        subtitleUrl: true,
                        createdAt: true,
                        // INTENTIONALLY EXCLUDING 'likes' AND 'views' TO COMPLY WITH LEGAL REQUIREMENTS
                    }
                }
            }
        });

        return res.json(profiles);
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
        let currentUser = null;

        // Optional Auth Extraction
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token) {
            try {
                currentUser = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as any;
            } catch (err) {
                // Invalid token -> treat as unauthenticated
            }
        }

        const profile = await prisma.profile.findUnique({
            where: { userId: req.params.id as string },
            include: {
                user: true,
                skills: true,
                videos: {
                    where: { status: 'APPROVED' },
                    select: {
                        id: true,
                        type: true,
                        url: true,
                        subtitleUrl: true,
                        createdAt: true,
                        // STRICLY EXCLUDING 'likes' AND 'views'
                    }
                }
            }
        });


        if (!profile) return res.status(404).json({ error: 'Not found' });

        const isOwner = currentUser && currentUser.id === profile.userId;

        // RGPD: Missing Age or Explicitly Hidden (Ticket 16)
        if (!isOwner) {
            if (profile.visible === false) {
                return res.status(403).json({ error: 'Access denied: Profile is hidden' });
            }
            if (profile.user.dateOfBirth === null) {
                return res.status(403).json({ error: 'Access denied: Profile owner has not verified their age' });
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

        const { user: _, ...publicProfile } = profile;
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
