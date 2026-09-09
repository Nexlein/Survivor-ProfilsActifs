import { Router } from 'express';
import { getCurrentUser, login, register, logout, refresh } from '../controllers/auth';
import { authenticateToken } from '../middlewares/auth';
import { loginRateLimiter, registerRateLimiter } from '../middlewares/rateLimit';

export const authRouter = Router();

authRouter.post('/login', loginRateLimiter, login);
authRouter.post('/register', registerRateLimiter, register);
authRouter.post('/refresh', refresh);

// Protected routes requiring valid JWT token
authRouter.get('/get-current-user', authenticateToken, getCurrentUser);
authRouter.post('/logout', authenticateToken, logout);

export default authRouter;