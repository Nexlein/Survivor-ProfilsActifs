import { Router } from 'express';
import healthRoutes from './health';

const router = Router();

// Mount sub-routers
router.use('/health', healthRoutes);
// e.g., router.use('/auth', authRoutes); // Auth team will add this

export default router;
