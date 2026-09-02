import { Router } from 'express';
import { getCurrentUser, login, register, logout, refresh } from '../controllers/auth';
import { authenticateToken } from '../middlewares/auth';

export const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/register', register);
authRouter.post('/refresh', refresh);

// Protected routes requiring valid JWT token
authRouter.get('/get-current-user', authenticateToken, getCurrentUser);
authRouter.post('/logout', authenticateToken, logout);

export default authRouter;