import { Router } from 'express';
import { getVideoFeed, approveVideo } from '../controllers/video.js';
import { authenticateToken, optionalAuthenticateToken } from '../middlewares/auth.js';
import { streamVideo, streamSubtitle } from '../controllers/videoPlayback.js';

export const videoRouter = Router();

videoRouter.get('/feed', authenticateToken, getVideoFeed);
videoRouter.put('/approval', authenticateToken, approveVideo);

// Video Provider Abstraction endpoints. Auth is optional here (not mandatory)
// because /profile/all and /profile/user/:id are an intentionally public,
// anonymous-browsable candidate catalog — an APPROVED video must stay
// playable by a logged-out visitor of those pages. The controller still
// enforces owner/admin-only access for PENDING/REJECTED videos.
videoRouter.get('/play/:id', optionalAuthenticateToken, streamVideo);
videoRouter.get('/play/:id/subtitle', optionalAuthenticateToken, streamSubtitle);

export default videoRouter;
