import { Router } from 'express';
import { exportData, deleteAccount } from '../controllers/compliance';

export const complianceRouter = Router();

complianceRouter.get('/data-export', exportData);
complianceRouter.delete('/account', deleteAccount);
