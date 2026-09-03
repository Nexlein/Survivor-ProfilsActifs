import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const uploadDir = path.resolve(__dirname, '../../uploads/videos');

const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const allowedMimeTypes = [
    'video/mp4',
    'video/quicktime', // MOV
    'video/x-msvideo', // AVI
    'text/vtt'
];

export const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB Strict limit
    fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only MP4, MOV, AVI videos and VTT subtitles are allowed.'));
        }
    }
});

const avatarUploadDir = path.resolve(__dirname, '../../uploads/avatars');

const avatarStorage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        if (!fs.existsSync(avatarUploadDir)) {
            fs.mkdirSync(avatarUploadDir, { recursive: true });
        }
        cb(null, avatarUploadDir);
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

export const uploadAvatar = multer({
    storage: avatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB — profile photo, not a video
    fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images are allowed.'));
        }
    }
});
