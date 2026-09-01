import { Router } from 'express';
import { getCurrentUser, login, register } from '../controllers/auth';

export const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/register', register);
authRouter.get('/get-current-user', getCurrentUser);

export default authRouter;