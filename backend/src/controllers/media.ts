import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import fs from 'fs';
import path from 'path';

export const streamVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.body?.user;
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const videoId = req.params.id as string;
        const video = await prisma.video.findUnique({
            where: { id: videoId },
        });

        if (!video || video.type !== 'UPLOAD' || !video.url) {
            return res.status(404).json({ error: 'Video not found' });
        }

        const userProfile = await prisma.profile.findUnique({ where: { userId: user.id } });
        const isOwner = userProfile?.id === video.profileId;
        const isAdmin = user.role === 'ADMIN';

        if (video.status === 'PENDING' && !isOwner && !isAdmin) {
            return res.status(403).json({ error: 'This video is pending moderation and cannot be accessed.' });
        }
        if (video.status === 'REJECTED' && !isOwner && !isAdmin) {
            return res.status(403).json({ error: 'This video was rejected by moderation.' });
        }

        const uploadDir = process.env.UPLOAD_DIR || './uploads';
        const absoluteUploadDir = path.resolve(process.cwd(), uploadDir);
        const filename = path.basename(video.url);
        const videoPath = path.join(absoluteUploadDir, filename);

        if (!fs.existsSync(videoPath)) {
            return res.status(404).json({ error: 'Media file not found on disk' });
        }

        const stat = fs.statSync(videoPath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(videoPath, { start, end });
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
            fs.createReadStream(videoPath).pipe(res);
        }
    } catch (error) {
        return next(error);
    }
};
