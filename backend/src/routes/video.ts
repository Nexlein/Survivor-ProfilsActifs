import { Router } from 'express';
import { uploadVideoFile, uploadVideoLink, deleteVideo, getVideo, likeVideo, viewVideo, getVideoFeed, approveVideo } from '../controllers/video';
import { authenticateToken } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

export const videoRouter = Router();

videoRouter.post('/upload-file', authenticateToken, upload.single('video'), uploadVideoFile);
videoRouter.post('/upload-link', authenticateToken, uploadVideoLink);
videoRouter.delete('/delete', authenticateToken, deleteVideo);
videoRouter.get('/get', authenticateToken, getVideo);
videoRouter.post('/like', authenticateToken, likeVideo);
videoRouter.post('/view', authenticateToken, viewVideo);
videoRouter.get('/feed', authenticateToken, getVideoFeed);
videoRouter.put('/approval', authenticateToken, approveVideo);

export default videoRouter;
