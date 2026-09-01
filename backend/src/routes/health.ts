import { Router } from 'express';
import { checkHealth } from '../controllers/health';

const router = Router();

// GET /health
// Returns the application and database health status.

router.get('/', checkHealth);

export default router;
