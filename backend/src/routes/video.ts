import { Router } from 'express';
import { uploadVideoFile, uploadVideoLink } from '../controllers/video';
import { authenticateToken } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

export const videoRouter = Router();

videoRouter.post('/upload-file', authenticateToken, upload.single('video'), uploadVideoFile);
videoRouter.post('/upload-link', authenticateToken, uploadVideoLink);

export default videoRouter;