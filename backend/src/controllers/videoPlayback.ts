import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma.js';
import { ProviderFactory } from '../providers/ProviderFactory.js';
import fs from 'fs';

const canAccess = async (user: any, video: { profileId: string; status: string }): Promise<boolean> => {
    if (video.status === 'APPROVED') return true;
    if (!user) return false;
    if (user.role === 'ADMIN') return true;

    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    return profile?.id === video.profileId;
};

export const streamVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const videoId = req.params.id as string;
        const user = (req as any).user;

        const video = await prisma.video.findUnique({ where: { id: videoId } });
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        // Block pending/rejected videos unless user is owner or admin
        if (!(await canAccess(user, video))) {
            return res.status(403).json({ error: 'Video is pending moderation or rejected.' });
        }

        const provider = ProviderFactory.getProvider();
        const providerStatus = await provider.status(video.providerId);
        const filePath = providerStatus === 'READY' ? await provider.getLocalFilePath(video.providerId) : null;

        if (!filePath) {
            // Not READY, or the active provider doesn't serve files locally (e.g. remote/dummy).
            return res.status(503).json({ error: 'Service de streaming vidéo en cours de maintenance (Mode Dégradé Actif).' });
        }

        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;

        // Serve streaming chunks for HTTP 206
        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

            const isValidRange = !isNaN(start) && !isNaN(end) && start >= 0 && end < fileSize && start <= end;
            if (!isValidRange) {
                res.setHeader('Content-Range', `bytes */${fileSize}`);
                return res.status(416).json({ error: 'Range Not Satisfiable' });
            }

            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(filePath, { start, end });
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            };
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            };
            res.writeHead(200, head);
            fs.createReadStream(filePath).pipe(res);
        }
    } catch (error) {
        next(error);
    }
};

export const streamSubtitle = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const videoId = req.params.id as string;
        const user = (req as any).user;

        const video = await prisma.video.findUnique({ where: { id: videoId } });
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        if (!(await canAccess(user, video))) {
            return res.status(403).json({ error: 'Video is pending moderation or rejected.' });
        }

        const provider = ProviderFactory.getProvider();
        const subPath = await provider.getLocalSubtitlePath(video.providerId);
        if (!subPath) {
            return res.status(404).send('Subtitle not found');
        }

        res.setHeader('Content-Type', 'text/vtt');
        fs.createReadStream(subPath).pipe(res);
    } catch (error) {
        next(error);
    }
};
