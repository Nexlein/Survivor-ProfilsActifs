import { getEighteenYearsAgo } from '../utils/date';
import { Request, Response, NextFunction } from 'express';
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
        const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
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
        const { user: _, ...updateData } = req.body;
        const profile = await prisma.profile.upsert({
            where: { userId: user.id },
            update: updateData,
            create: {
                userId: user.id,
                fullName: updateData.fullName || 'Utilisateur',
                ...updateData,
            },
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
        const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
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

        const whereClause: any = {};

        // If the user is NOT a recruiter, strictly hide all minors (< 18)
        if (user.role !== 'RECRUITER') {
            whereClause.user = {
                dateOfBirth: { lte: eighteenYearsAgo }
            };
        }

        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const take = 20;
        const skip = (page - 1) * take;

        const profiles = await prisma.profile.findMany({
            where: whereClause,
            take,
            skip,
            include: {
                videos: {
                    where: { status: 'APPROVED' }, // Only show approved videos
                    select: {
                        id: true,
                        type: true,
                        // DO NOT EXPOSE DIRECT URL OUTSIDE OF STREAMING IF PENDING, BUT HERE WE FILTER BY APPROVED
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
 * @access Private
 */
export const getProfileByUserId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.body?.user;
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const profile = await prisma.profile.findUnique({ where: { userId: req.params.id as string } });
        return res.json(profile);
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
            fs.unlink(oldPath, () => {});
        }

        return res.json(profile);
    } catch (error) {
        return next(error);
    }
};

