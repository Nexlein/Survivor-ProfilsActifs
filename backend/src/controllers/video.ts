import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import fs from 'fs';
import path from 'path';

// Helper to remove likes and views
const stripPublicVideoStats = (video: any) => {
    if (!video) return video;
    const { likes, views, ...safeVideo } = video;
    return safeVideo;
};

export const uploadVideoFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No video file provided' });
        }
        const { profileId, consentTextVersion } = req.body;
        if (!profileId) {
            return res.status(400).json({ error: 'profileId is required' });
        }

        const profileExists = await prisma.profile.findUnique({ where: { id: profileId } });
        if (!profileExists) {
            return res.status(404).json({ error: `Profile with ID '${profileId}' does not exist` });
        }

        const video = await prisma.video.create({
            data: {
                profileId,
                type: 'UPLOAD',
                url: `/uploads/videos/${file.filename}`,
                consentDate: new Date(),
                consentTextVersion: consentTextVersion || 'v1.0',
                status: 'PENDING'
            },
        });

        return res.status(201).json(stripPublicVideoStats(video));
    } catch (error) {
        return next(error);
    }
};

export const uploadVideoLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { profileId, videoUrl, consentTextVersion } = req.body;
        if (!profileId) {
            return res.status(400).json({ error: 'profileId is required' });
        }
        if (!videoUrl) {
            return res.status(400).json({ error: 'videoUrl is required' });
        }

        const profileExists = await prisma.profile.findUnique({ where: { id: profileId } });
        if (!profileExists) {
            return res.status(404).json({ error: `Profile with ID '${profileId}' does not exist` });
        }

        const video = await prisma.video.create({
            data: {
                profileId,
                type: 'LINK',
                url: videoUrl,
                consentDate: new Date(),
                consentTextVersion: consentTextVersion || 'v1.0',
                status: 'PENDING'
            },
        });

        return res.status(201).json(stripPublicVideoStats(video));
    } catch (error) {
        return next(error);
    }
};

export const deleteVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'Video ID is required' });
        }
        const video = await prisma.video.delete({
            where: { id: id },
        });

        if (video.type === 'UPLOAD' && video.url) {
            const filePath = path.resolve(__dirname, '../../', video.url.replace(/^\//, ''));
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        return res.status(200).json({
            message: 'Video deleted successfully',
            id: video.id
        });
    } catch (error) {
        return next(error);
    }
};

export const getVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'Video ID is required' });
        }
        const video = await prisma.video.findUnique({
            where: { id: id },
        });
        
        // Strip stats for standard view (owner should use a different endpoint or logic)
        return res.status(200).json(stripPublicVideoStats(video));
    } catch (error) {
        return next(error);
    }
};

export const likeVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'Video ID is required' });
        }
        const video = await prisma.video.update({
            where: { id: id },
            data: { likes: { increment: 1 } },
        });
        return res.status(200).json(stripPublicVideoStats(video));
    } catch (error) {
        return next(error);
    }
};

export const viewVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'Video ID is required' });
        }
        const video = await prisma.video.update({
            where: { id: id },
            data: { views: { increment: 1 } },
        });
        return res.status(200).json(stripPublicVideoStats(video));
    } catch (error) {
        return next(error);
    }
};

/**
 * Controller: Get Video Feed with Server Pagination
 * @route GET /api/video/feed
 * @access Private
 */
export const getVideoFeed = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.body?.user;
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const take = 20;
        const skip = (page - 1) * take;

        // Calculate the date 18 years ago to filter out minors for non-recruiters
        const eighteenYearsAgo = new Date();
        eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

        const whereClause: any = {
            status: 'APPROVED'
        };

        if (user.role !== 'RECRUITER') {
            whereClause.profile = {
                user: {
                    dateOfBirth: { lte: eighteenYearsAgo }
                }
            };
        }

        const videos = await prisma.video.findMany({
            where: whereClause,
            take,
            skip,
            orderBy: { createdAt: 'desc' },
        });

        // Strip likes and views for public feed
        const safeVideos = videos.map(stripPublicVideoStats);

        return res.status(200).json(safeVideos);
    } catch (error) {
        return next(error);
    }
};

/**
 * Controller: Approve or Reject a Video (Admin Only)
 * @route PUT /api/video/approval
 * @access Private (Admin)
 */
export const approveVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.body?.user;
        if (!user || user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden. Admin role required.' });
        }

        const { id, approved, reason } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Video ID is required' });
        }

        if (approved === undefined) {
            return res.status(400).json({ error: 'approved boolean is required' });
        }

        if (approved === false && !reason) {
            return res.status(400).json({ error: 'A rejection reason is required when rejecting a video.' });
        }

        const updatedVideo = await prisma.video.update({
            where: { id: id },
            data: {
                status: approved ? 'APPROVED' : 'REJECTED',
                rejectionReason: approved ? null : reason,
                moderatedById: user.id,
                moderatedAt: new Date(),
            },
        });

        return res.status(200).json(updatedVideo);
    } catch (error) {
        return next(error);
    }
};
