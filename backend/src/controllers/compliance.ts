import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import fs from 'fs';
import path from 'path';

/**
 * Controller: Export personal data (Right of Access)
 * @route GET /compliance/data-export
 * @access Private
 */
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
                interactions: true, // Recruiter interactions
                loginLogs: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({
            message: 'GDPR export successful',
            data: user,
        });
    } catch (error) {
        return next(error);
    }
};

/**
 * Controller: Delete account and physical data (Right to be Forgotten)
 * @route DELETE /compliance/account
 * @access Private
 */
export const deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userReq = req.body?.user;
        if (!userReq) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // 1. Fetch user to get associated videos (to physically delete them)
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

        // 2. Physically delete media files if they are UPLOAD type
        if (user.profile && user.profile.videos.length > 0) {
            const uploadDir = process.env.UPLOAD_DIR || './uploads';
            const absoluteUploadDir = path.resolve(process.cwd(), uploadDir);

            for (const video of user.profile.videos) {
                if (video.type === 'UPLOAD') {
                    // Try removing the main video file
                    if (video.url) {
                        try {
                            const filename = path.basename(video.url);
                            const videoPath = path.join(absoluteUploadDir, filename);
                            if (fs.existsSync(videoPath)) {
                                fs.unlinkSync(videoPath);
                                console.log(`[RGPD] Physically deleted video: ${videoPath}`);
                            }
                        } catch (err) {
                            console.error(`[RGPD] Failed to delete video file ${video.url}`, err);
                        }
                    }

                    // Try removing the subtitle file
                    if (video.subtitleUrl) {
                        try {
                            const subFilename = path.basename(video.subtitleUrl);
                            const subtitlePath = path.join(absoluteUploadDir, subFilename);
                            if (fs.existsSync(subtitlePath)) {
                                fs.unlinkSync(subtitlePath);
                                console.log(`[RGPD] Physically deleted subtitles: ${subtitlePath}`);
                            }
                        } catch (err) {
                            console.error(`[RGPD] Failed to delete subtitle file ${video.subtitleUrl}`, err);
                        }
                    }
                }
            }
        }

        // 3. Delete user from database (Cascades automatically to Profile, Videos, etc.)
        await prisma.user.delete({
            where: { id: user.id },
        });

        return res.status(200).json({ message: 'Right to be forgotten executed. Account and physical files permanently deleted.' });
    } catch (error) {
        return next(error);
    }
};
