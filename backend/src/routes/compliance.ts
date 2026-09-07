import { Router } from 'express';
import { exportData, deleteAccount } from '../controllers/compliance';
import { authenticateToken } from '../middlewares/auth';

export const complianceRouter = Router();

complianceRouter.get('/data-export', authenticateToken, exportData);
complianceRouter.delete('/account', authenticateToken, deleteAccount);
