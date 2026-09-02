import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import fs from 'fs';
import path from 'path';

/**
 * Controller: Upload video file for profile.
 * @route POST /api/video/upload-file
 * @access Private
 */
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
            },
        });

        return res.status(201).json(video);
    } catch (error) {
        return next(error);
    }
};

/**
 * Controller: Upload Video link for profile
 * @route POST /api/video/upload-link
 */
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
            },
        });

        return res.status(201).json(video);
    } catch (error) {
        return next(error);
    }
};

/**
 * Controller: Delete video profile.
 * @route DELETE /api/video/:id
 * @access Private
 */
export const deleteVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'Video ID is required' });
        }
        const video = await prisma.video.delete({
            where: {
                id: id,
            },
        });

        // Local suppression
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
}

/**
 * Controller: Get video profile.
 * @route GET /api/video/:id
 * @access Private
 */
export const getVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'Video ID is required' });
        }
        const video = await prisma.video.findUnique({
            where: {
                id: id,
            },
        });
        return res.status(200).json(video);
    } catch (error) {
        return next(error);
    }
}

/**
 * Controller: POST Like a video
 * @route POST /api/video/like
 * @access Private
 */
export const likeVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'Video ID is required' });
        }
        const video = await prisma.video.update({
            where: {
                id: id,
            },
            data: {
                likes: {
                    increment: 1,
                },
            },
        });
        return res.status(200).json(video);
    } catch (error) {
        return next(error);
    }
}

/**
 * Controller: POST view a video
 * @route POST /api/video/view
 * @access Private
 */
export const viewVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'Video ID is required' });
        }
        const video = await prisma.video.update({
            where: {
                id: id,
            },
            data: {
                views: {
                    increment: 1,
                },
            },
        });
        return res.status(200).json(video);
    } catch (error) {
        return next(error);
    }
}
