import { Router } from 'express';
import { deleteProfile, getProfile, updateProfile, getCurrentProfile, getAllProfiles, getProfileByUserId, uploadProfileAvatar } from '../controllers/profile';
import { authenticateToken } from '../middlewares/auth';
import { uploadAvatar } from '../middlewares/upload';

export const profileRouter = Router();

// Protect all profile routes with JWT authentication middleware
profileRouter.use(authenticateToken);

profileRouter.get('/', getProfile);
profileRouter.put('/', updateProfile);
profileRouter.delete('/', deleteProfile);
profileRouter.get('/me', getCurrentProfile);
profileRouter.get('/all', getAllProfiles);
profileRouter.get('/user/:id', getProfileByUserId);
profileRouter.post('/avatar', uploadAvatar.single('avatar'), uploadProfileAvatar);

export default profileRouter;
