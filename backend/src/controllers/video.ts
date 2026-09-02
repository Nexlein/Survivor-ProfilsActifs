import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';


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
