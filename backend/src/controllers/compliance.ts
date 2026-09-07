import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma.js';
import { ProviderFactory } from '../providers/ProviderFactory.js';

export const exportData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userReq = req.body?.user;
        if (!userReq) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userReq.id },
            include: {
                profile: {
                    include: {
                        skills: true,
                        videos: true,
                        interactions: true,
                        questionnaireProgress: true,
                        questionnaireResult: true,
                    },
                },
                interactions: true,
                loginLogs: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Never include the password hash in a data export, even the user's
        // own — it has no legitimate use here and shouldn't leave the DB.
        const { passwordHash, ...exportableUser } = user;

        return res.status(200).json({
            message: 'GDPR export successful',
            data: exportableUser,
        });
    } catch (error) {
        return next(error);
    }
};

export const deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userReq = req.body?.user;
        if (!userReq) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userReq.id },
            include: {
                profile: {
                    include: {
                        videos: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Physically delete media files via Provider abstraction
        if (user.profile && user.profile.videos.length > 0) {
            const provider = ProviderFactory.getProvider();
            for (const video of user.profile.videos) {
                try {
                    await provider.delete(video.providerId);
                    console.log(`[RGPD] Physically deleted video via provider: ${video.providerId}`);
                } catch (err) {
                    console.error(`[RGPD] Failed to delete video ${video.providerId}`, err);
                }
            }
        }

        await prisma.user.delete({
            where: { id: user.id },
        });

        return res.status(200).json({ message: 'Right to be forgotten executed. Account and physical files permanently deleted.' });
    } catch (error) {
        return next(error);
    }
};
