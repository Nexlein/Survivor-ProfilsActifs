import { Router } from 'express';
import { deleteProfile, getProfile, updateProfile, getCurrentProfile, getAllProfiles, getProfileByUserId, uploadProfileAvatar } from '../controllers/profile';
import { authenticateToken } from '../middlewares/auth';
import { uploadAvatar } from '../middlewares/upload';

export const profileRouter = Router();

// Protect specific profile routes with JWT authentication middleware
profileRouter.get('/', authenticateToken, getProfile);
profileRouter.put('/', authenticateToken, updateProfile);
profileRouter.delete('/', authenticateToken, deleteProfile);
profileRouter.get('/me', authenticateToken, getCurrentProfile);
profileRouter.get('/all', authenticateToken, getAllProfiles);
profileRouter.post('/avatar', authenticateToken, uploadAvatar.single('avatar'), uploadProfileAvatar);

// Public route (optional auth handled in controller for age checks)
profileRouter.get('/user/:id', getProfileByUserId);

export default profileRouter;
