import { getEighteenYearsAgo } from '../utils/date.js';
import { isValidVideoFile } from '../utils/videoMagicBytes.js';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma.js';
import fs from 'fs';
import { ProviderFactory } from '../providers/ProviderFactory.js';

export const createProfileVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const { consentTextVersion, type } = req.body;

        if (type === 'LINK') {
            return res.status(400).json({ error: 'LINK integration is permanently disabled.' });
        }

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const videoFile = files?.['video']?.[0];
        const subtitleFile = files?.['subtitle']?.[0];

        if (!videoFile) {
            return res.status(400).json({ error: 'No video file provided' });
        }

        if (!isValidVideoFile(videoFile.path)) {
            fs.unlink(videoFile.path, () => { });
            if (subtitleFile) fs.unlink(subtitleFile.path, () => { });
            return res.status(400).json({
                error: 'Invalid file content',
                message: 'The uploaded file is not a valid MP4, MOV or AVI video.',
            });
        }

        const provider = ProviderFactory.getProvider();
        const providerName = ProviderFactory.getProviderName();
        const providerId = await provider.store(videoFile, subtitleFile);

        const video = await prisma.video.create({
            data: {
                profileId: profile.id,
                type: 'UPLOAD',
                providerId,
                providerName,
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

export const deleteProfileVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user || req.body?.user;
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
        if (!profile) return res.status(404).json({ error: 'Profile not found' });

        const videoId = req.params.id as string;
        if (!videoId) return res.status(400).json({ error: 'Video ID is required' });

        const existingVideo = await prisma.video.findUnique({ where: { id: videoId } });
        if (!existingVideo) return res.status(404).json({ error: 'Video not found' });

        if (existingVideo.profileId !== profile.id && user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'You do not have permission to delete this video' });
        }

        const video = await prisma.video.delete({
            where: { id: videoId },
        });

        // GDPR Right to Be Forgotten
        const provider = ProviderFactory.getProvider();
        await provider.delete(existingVideo.providerId);

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
        const id = req.params.id || req.body.id;
        if (!id) return res.status(400).json({ error: 'Video ID is required' });

        const video = await prisma.video.findUnique({ where: { id: id } });
        if (!video) return res.status(404).json({ error: 'Video not found' });

        const user = (req as any).user || req.body?.user;
        const userProfile = user ? await prisma.profile.findUnique({ where: { userId: user.id } }) : null;
        const isOwner = userProfile?.id === video.profileId;
        const isAdmin = user?.role === 'ADMIN';

        if ((video.status === 'PENDING' || video.status === 'REJECTED') && !isOwner && !isAdmin) {
            return res.status(403).json({ error: 'This video is not available.' });
        }

        const provider = ProviderFactory.getProvider();
        const url = await provider.playbackUrl(video.providerId);
        const subtitleUrl = await provider.subtitleUrl(video.providerId);
        return res.status(200).json({ ...video, url, subtitleUrl });
    } catch (error) { return next(error); }
};

export const getVideoFeed = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user || req.body?.user;
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const pageSize = 20;
        const skip = (page - 1) * pageSize;

        // Admin moderation queue: the public feed below only ever surfaces
        // APPROVED videos, so admins need their own branch to list videos by
        // moderation status (defaulting to the PENDING queue).
        if (user.role === 'ADMIN') {
            const requestedStatus = (req.query.status as string || 'PENDING').toUpperCase();
            const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
            const status = validStatuses.includes(requestedStatus) ? requestedStatus : 'PENDING';

            const [videos, total] = await Promise.all([
                prisma.video.findMany({
                    where: { status: status as any },
                    take: pageSize,
                    skip,
                    orderBy: { createdAt: 'asc' },
                    include: { profile: { select: { id: true, fullName: true, avatarUrl: true } } },
                }),
                prisma.video.count({ where: { status: status as any } }),
            ]);

            const provider = ProviderFactory.getProvider();
            const videosWithUrls = await Promise.all(videos.map(async (v) => ({
                ...v,
                url: await provider.playbackUrl(v.providerId),
                subtitleUrl: await provider.subtitleUrl(v.providerId)
            })));
            return res.status(200).json({ videos: videosWithUrls, total, page, pageSize });
        }

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

        const [videos, total] = await Promise.all([
            prisma.video.findMany({
                where: whereClause, take: pageSize, skip, orderBy: { createdAt: 'desc' },
            }),
            prisma.video.count({ where: whereClause }),
        ]);

        const provider = ProviderFactory.getProvider();
        const videosWithUrls = await Promise.all(videos.map(async (v) => ({
            ...v,
            url: await provider.playbackUrl(v.providerId),
            subtitleUrl: await provider.subtitleUrl(v.providerId)
        })));
        return res.status(200).json({ videos: videosWithUrls, total, page, pageSize });
    } catch (error) { return next(error); }
};

export const approveVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user || req.body?.user;
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
