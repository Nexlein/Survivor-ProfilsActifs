import { Router } from 'express';
import { getVideo, likeVideo, viewVideo, getVideoFeed, approveVideo } from '../controllers/video';
import { authenticateToken } from '../middlewares/auth';

export const videoRouter = Router();

videoRouter.get('/get', authenticateToken, getVideo);
videoRouter.post('/like', authenticateToken, likeVideo);
videoRouter.post('/view', authenticateToken, viewVideo);
videoRouter.get('/feed', authenticateToken, getVideoFeed);
videoRouter.put('/approval', authenticateToken, approveVideo);

export default videoRouter;
