import { Router } from 'express';
import { deleteProfile, getProfile, updateProfile, getCurrentProfile, getAllProfiles, getProfileByUserId, uploadProfileAvatar } from '../controllers/profile';
import { createProfileVideo, deleteProfileVideo } from '../controllers/video';
import { authenticateToken } from '../middlewares/auth';
import { upload, uploadAvatar } from '../middlewares/upload';

export const profileRouter = Router();

// Protect specific profile routes with JWT authentication middleware
profileRouter.get('/', authenticateToken, getProfile);
profileRouter.put('/', authenticateToken, updateProfile);
profileRouter.delete('/', authenticateToken, deleteProfile);
profileRouter.get('/me', authenticateToken, getCurrentProfile);
profileRouter.get('/all', authenticateToken, getAllProfiles);
profileRouter.post('/avatar', authenticateToken, uploadAvatar.single('avatar'), uploadProfileAvatar);

// Unified Video Routes (Ticket #83)
profileRouter.post('/videos', authenticateToken, upload.fields([{ name: 'video', maxCount: 1 }, { name: 'subtitle', maxCount: 1 }]), createProfileVideo);
profileRouter.delete('/videos/:id', authenticateToken, deleteProfileVideo);

// Public route (optional auth handled in controller for age checks)
profileRouter.get('/user/:id', getProfileByUserId);

export default profileRouter;
