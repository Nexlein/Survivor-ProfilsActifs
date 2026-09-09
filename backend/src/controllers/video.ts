import { getEighteenYearsAgo } from '../utils/date.js';
import { isValidVideoFile } from '../utils/videoMagicBytes.js';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma.js';
import fs from 'fs';
import { ProviderFactory } from '../providers/ProviderFactory.js';
import { getEnvInt } from '../utils/env.js';

export const createProfileVideo = async (req: Request, res: Response, next: NextFunction) => {
    // Multer (upstream middleware) has already written these to disk by the
    // time this handler runs, regardless of which path below returns early —
    // track whether the provider took ownership of them so the `finally`
    // block can clean up orphans on every other exit path (404, LINK
    // rejection, invalid content, thrown error).
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const videoFile = files?.['video']?.[0];
    const subtitleFile = files?.['subtitle']?.[0];
    let filesConsumed = false;

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

        if (!videoFile) {
            return res.status(400).json({ error: 'No video file provided' });
        }

        if (!isValidVideoFile(videoFile.path)) {
            return res.status(400).json({
                error: 'Invalid file content',
                message: 'The uploaded file is not a valid MP4, MOV or AVI video.',
            });
        }

        const provider = ProviderFactory.getProvider();
        const providerName = ProviderFactory.getProviderName();
        const providerId = await provider.store(videoFile, subtitleFile);
        filesConsumed = true; // provider.store() already moved/deleted the temp files

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
    } finally {
        if (!filesConsumed) {
            if (videoFile) fs.unlink(videoFile.path, () => { });
            if (subtitleFile) fs.unlink(subtitleFile.path, () => { });
        }
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

        // Delete the physical file before the DB row: if disk deletion fails,
        // abort before the row is gone so the video can't become an
        // untraceable orphan on disk.
        const provider = ProviderFactory.getProvider();
        try {
            await provider.delete(existingVideo.providerId);
        } catch (err) {
            console.error(`[RGPD] Failed to delete video file for ${existingVideo.providerId}`, err);
            return res.status(500).json({ error: 'Failed to delete video file. Please try again.' });
        }

        const video = await prisma.video.delete({
            where: { id: videoId },
        });

        return res.status(200).json({
            message: 'Video deleted successfully',
            id: video.id
        });
    } catch (error) {
        return next(error);
    }
};

export const getVideoFeed = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user || req.body?.user;
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const pageSize = getEnvInt('FEED_PAGE_SIZE', 20);
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

            return res.status(200).json({ videos, total, page, pageSize });
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

        return res.status(200).json({ videos, total, page, pageSize });
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
