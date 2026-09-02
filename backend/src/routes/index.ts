import { Router } from 'express';
import healthRoutes from './health';
import { authRouter } from './auth';
import { profileRouter } from './profile';
import { videoRouter } from './video';

const router = Router();

// Mount sub-routers
router.use('/health', healthRoutes);
router.use('/auth', authRouter);
router.use('/profile', profileRouter);
router.use('/video', videoRouter);

export default router;
