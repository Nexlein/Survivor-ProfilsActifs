import { Router } from 'express';
import { createInteraction, getNotifications, markNotificationRead, getInteractionStats } from '../controllers/interaction';
import { authenticateToken } from '../middlewares/auth';

export const interactionRouter = Router();

interactionRouter.post('/', authenticateToken, createInteraction);
interactionRouter.get('/notifications', authenticateToken, getNotifications);
interactionRouter.put('/:id/read', authenticateToken, markNotificationRead);
interactionRouter.get('/stats', authenticateToken, getInteractionStats);

export default interactionRouter;
