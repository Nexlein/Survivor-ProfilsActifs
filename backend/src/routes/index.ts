import { Router } from 'express';
import healthRoutes from './health';

const router = Router();

// Mount sub-routers
router.use('/health', healthRoutes);

// Auth team will add this :
// e.g., router.use('/auth', authRoutes);

export default router;
