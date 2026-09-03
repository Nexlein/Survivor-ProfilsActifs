import { Router } from 'express';
import { streamVideo, streamSubtitle } from '../controllers/media';
import { authenticateToken } from '../middlewares/auth';

export const mediaRouter = Router();

mediaRouter.get('/:id', authenticateToken, streamVideo);
mediaRouter.get('/:id/subtitle', authenticateToken, streamSubtitle);

export default mediaRouter;
