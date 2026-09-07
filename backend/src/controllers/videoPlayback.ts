import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma.js';
import fs from 'fs';
import path from 'path';

const STORAGE_DIR = path.join(process.cwd(), 'storage', 'videos');

export const streamVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const videoId = req.params.id as string;
        const user = (req as any).user;

        const video = await prisma.video.findUnique({ where: { id: videoId } });
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        const isOwner = user && video.profileId === user.profile?.id;
        const isAdmin = user && user.role === 'ADMIN';

        // Block pending/rejected videos unless user is owner or admin
        if (video.status !== 'APPROVED' && !isOwner && !isAdmin) {
            return res.status(403).json({ error: 'Video is pending moderation or rejected.' });
        }

        // DEGRADED MODE / PROVIDER ABSTRACTION
        if (process.env.VIDEO_PROVIDER === 'dummy' || video.providerName !== 'local') {
            return res.status(503).json({ error: 'Service de streaming vidéo en cours de maintenance (Mode Dégradé Actif).' });
        }

        const files = fs.readdirSync(STORAGE_DIR);
        const videoFile = files.find(f => f.startsWith(video.providerId) && !f.endsWith('.vtt'));

        if (!videoFile) {
            return res.status(404).json({ error: 'Media file not found on disk.' });
        }

        const filePath = path.join(STORAGE_DIR, videoFile);
        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;

        // Serve streaming chunks for HTTP 206
        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
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
        const video = await prisma.video.findUnique({ where: { id: videoId } });
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        const subPath = path.join(STORAGE_DIR, `${video.providerId}.vtt`);
        if (!fs.existsSync(subPath)) {
            return res.status(404).send('Subtitle not found');
        }

        res.setHeader('Content-Type', 'text/vtt');
        fs.createReadStream(subPath).pipe(res);
    } catch (error) {
        next(error);
    }
};
