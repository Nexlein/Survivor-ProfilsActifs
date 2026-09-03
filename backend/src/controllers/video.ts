import { getEighteenYearsAgo } from '../utils/date';
import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import fs from 'fs';
import path from 'path';

/**
 * Controller: Create Profile Video (Unified LINK/UPLOAD)
 * @route POST /api/profile/videos
 * @access Private
 */
export const createProfileVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // req.body.user (set by authenticateToken) doesn't survive here: multer
        // parses the multipart body *after* auth runs and replaces req.body
        // wholesale. req.user is set independently by the same middleware and
        // isn't affected, so read from there instead (same fix as the avatar
        // upload route).
        const user = (req as any).user;
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const { type, videoUrl, consentTextVersion, subtitleUrl: linkSubtitleUrl } = req.body;

        let finalUrl = '';
        let subtitleUrl: string | null = null;

        if (type === 'UPLOAD') {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const videoFile = files?.['video']?.[0];
            const subtitleFile = files?.['subtitle']?.[0];

            if (!videoFile) {
                return res.status(400).json({ error: 'No video file provided for UPLOAD type' });
            }
            finalUrl = `/uploads/videos/${videoFile.filename}`;
            subtitleUrl = subtitleFile ? `/uploads/videos/${subtitleFile.filename}` : null;
        } else if (type === 'LINK') {
            if (!videoUrl) {
                return res.status(400).json({ error: 'videoUrl is required for LINK type' });
            }
            finalUrl = videoUrl;
            subtitleUrl = linkSubtitleUrl || null;
        } else {
            return res.status(400).json({ error: 'type must be LINK or UPLOAD' });
        }

        const video = await prisma.video.create({
            data: {
                profileId: profile.id,
                type,
                url: finalUrl,
                subtitleUrl,
                consentDate: new Date(),
                consentTextVersion: consentTextVersion || 'v1.0',
                status: 'PENDING'
            },
        });

        return res.status(201).json(video);
    } catch (error) {
        return next(error);
    }
};

/**
 * Controller: Delete Profile Video
 * @route DELETE /api/profile/videos/:id
 * @access Private
 */
export const deleteProfileVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.body?.user;
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
        if (!profile) return res.status(404).json({ error: 'Profile not found' });

        const videoId = req.params.id as string;
        if (!videoId) return res.status(400).json({ error: 'Video ID is required' });

        const existingVideo = await prisma.video.findUnique({ where: { id: videoId } });
        if (!existingVideo) return res.status(404).json({ error: 'Video not found' });

        // SECURITY CHECK: Ensure the video belongs to the authenticated user's profile
        if (existingVideo.profileId !== profile.id) {
            return res.status(403).json({ error: 'You do not have permission to delete this video' });
        }

        const video = await prisma.video.delete({
            where: { id: videoId },
        });

        // PHYSICAL DELETION (Right to be forgotten)
        if (video.type === 'UPLOAD') {
            if (video.url) {
                const filePath = path.resolve(__dirname, '../../', video.url.replace(/^\//, ''));
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }
            if (video.subtitleUrl) {
                const subPath = path.resolve(__dirname, '../../', video.subtitleUrl.replace(/^\//, ''));
                if (fs.existsSync(subPath)) fs.unlinkSync(subPath);
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
        if (!id) return res.status(400).json({ error: 'Video ID is required' });

        const video = await prisma.video.findUnique({ where: { id: id } });
        if (!video) return res.status(404).json({ error: 'Video not found' });

        const user = req.body?.user;
        const userProfile = user ? await prisma.profile.findUnique({ where: { userId: user.id } }) : null;
        const isOwner = userProfile?.id === video.profileId;
        const isAdmin = user?.role === 'ADMIN';

        if ((video.status === 'PENDING' || video.status === 'REJECTED') && !isOwner && !isAdmin) {
            return res.status(403).json({ error: 'This video is not available.' });
        }

        return res.status(200).json(video);
    } catch (error) { return next(error); }
};

export const getVideoFeed = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.body?.user;
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const take = 20;
        const skip = (page - 1) * take;

        const eighteenYearsAgo = getEighteenYearsAgo();

        const whereClause: any = {
            status: 'APPROVED',
            profile: {
                visible: true,
                user: { dateOfBirth: { not: null } }
            }
        };

        if (user.role !== 'RECRUITER') {
            whereClause.profile.user.dateOfBirth = { lte: eighteenYearsAgo };
        }

        const videos = await prisma.video.findMany({
            where: whereClause, take, skip, orderBy: { createdAt: 'desc' },
        });

        return res.status(200).json(videos);
    } catch (error) { return next(error); }
};

export const approveVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.body?.user;
        if (!user || user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden. Admin role required.' });
        }

        const { id, approved, reason } = req.body;
        if (!id) return res.status(400).json({ error: 'Video ID is required' });
        if (approved === undefined) return res.status(400).json({ error: 'approved boolean is required' });
        if (approved === false && !reason) return res.status(400).json({ error: 'A rejection reason is required when rejecting a video.' });

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
    } catch (error) { return next(error); }
};
