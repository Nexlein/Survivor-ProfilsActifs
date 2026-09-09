import { Router } from 'express';
import { getVideo, getVideoFeed, approveVideo } from '../controllers/video.js';
import { authenticateToken } from '../middlewares/auth.js';
import { streamVideo, streamSubtitle } from '../controllers/videoPlayback.js';

export const videoRouter = Router();

videoRouter.get('/get', authenticateToken, getVideo);
videoRouter.get('/feed', authenticateToken, getVideoFeed);
videoRouter.put('/approval', authenticateToken, approveVideo);

// Video Provider Abstraction endpoints
videoRouter.get('/play/:id', authenticateToken, streamVideo);
videoRouter.get('/play/:id/subtitle', authenticateToken, streamSubtitle);

export default videoRouter;
