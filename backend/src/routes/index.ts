import { Router } from 'express';
import healthRoutes from './health';
import { authRouter } from './auth';
import { profileRouter } from './profile';
import { complianceRouter } from './compliance';
import { videoRouter } from './video';
import { mediaRouter } from './media';

const router = Router();

// Mount sub-routers
router.use('/health', healthRoutes);
router.use('/auth', authRouter);
router.use('/profile', profileRouter);
router.use('/compliance', complianceRouter);
router.use('/video', videoRouter);
router.use('/media', mediaRouter);

export default router;
