import { Router } from 'express';
import {
    getModerationQueue,
    approveModeration,
    rejectModeration,
    suspendModeration,
    hideProfile,
} from '../controllers/admin';
import { authenticateToken } from '../middlewares/auth';
import { requireRole } from '../middlewares/role';

export const adminRouter = Router();

// Every route below is ADMIN-only.
adminRouter.use(authenticateToken, requireRole('ADMIN'));

adminRouter.get('/moderation/queue', getModerationQueue);
adminRouter.patch('/moderation/:userId/approve', approveModeration);
adminRouter.patch('/moderation/:userId/reject', rejectModeration);
adminRouter.patch('/moderation/:userId/suspend', suspendModeration);
adminRouter.post('/profiles/:id/hide', hideProfile);

export default adminRouter;
