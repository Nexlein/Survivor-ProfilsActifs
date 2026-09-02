import { Router } from 'express';
import { getCurrentUser, login, register, logout, refresh } from '../controllers/auth';

export const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/register', register);
authRouter.get('/get-current-user', getCurrentUser);
authRouter.post('/logout', logout);
authRouter.post('/refresh', refresh);

export default authRouter;