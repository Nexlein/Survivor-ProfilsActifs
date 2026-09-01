import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';

/**
 * Controller: Get profile of the current user
 * @route GET /api/profile
 * @access Private
 */
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.body.user;
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
        const user = req.body.user;
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const profile = await prisma.profile.update({
            where: { userId: user.id },
            data: req.body
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
        const user = req.body.user;
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const profile = await prisma.profile.delete({ where: { userId: user.id } });
        return res.json(profile);
    } catch (error) {
        return next(error);
    }
};
