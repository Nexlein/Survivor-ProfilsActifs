import { getEighteenYearsAgo } from '../utils/date';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
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

        const { fullName, targetSector, location, companyName, industry, position, skills } = req.body;

        if (skills && Array.isArray(skills) && skills.length > 10) {
            return res.status(400).json({ error: 'Maximum 10 skills allowed' });
        }

        const updateData: any = {};
        if (fullName !== undefined) updateData.fullName = fullName;
        if (targetSector !== undefined) updateData.targetSector = targetSector;
        if (location !== undefined) updateData.location = location;

        if (user.role === 'RECRUITER') {
            if (companyName !== undefined) updateData.companyName = companyName;
            if (industry !== undefined) updateData.industry = industry;
            if (position !== undefined) updateData.position = position;
        }

        if (skills && Array.isArray(skills)) {
            updateData.skills = {
                set: [], // Clear existing relations
                connectOrCreate: skills.map((skillName: string) => ({
                    where: { name: skillName },
                    create: { name: skillName }
                }))
            };
        }

        const profile = await prisma.profile.upsert({
            where: { userId: user.id },
            update: updateData,
            create: {
                userId: user.id,
                fullName: fullName || 'Utilisateur',
                targetSector,
                location,
                ...(user.role === 'RECRUITER' ? { companyName, industry, position } : {}),
                ...(updateData.skills ? { skills: updateData.skills } : {})
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
