import { Router } from 'express';
import { streamVideo } from '../controllers/media';
import { authenticateToken } from '../middlewares/auth';

export const mediaRouter = Router();

mediaRouter.get('/:id', authenticateToken, streamVideo);

export default mediaRouter;
