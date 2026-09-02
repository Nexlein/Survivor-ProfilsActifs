import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';

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

        // Calculate the date 18 years ago to filter out minors for non-recruiters
        const eighteenYearsAgo = new Date();
        eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

        const whereClause: any = {};

        // If the user is NOT a recruiter, strictly hide all minors (< 18)
        if (user.role !== 'RECRUITER') {
            whereClause.user = {
                dateOfBirth: { lte: eighteenYearsAgo }
            };
        }

        const profiles = await prisma.profile.findMany({
            where: whereClause,
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

