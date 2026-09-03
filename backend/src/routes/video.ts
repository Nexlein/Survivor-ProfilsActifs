import { Router } from 'express';
import { getVideo, getVideoFeed, approveVideo } from '../controllers/video';
import { authenticateToken } from '../middlewares/auth';

export const videoRouter = Router();

videoRouter.get('/get', authenticateToken, getVideo);
videoRouter.get('/feed', authenticateToken, getVideoFeed);
videoRouter.put('/approval', authenticateToken, approveVideo);

export default videoRouter;
