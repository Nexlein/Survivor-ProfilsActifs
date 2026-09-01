import { Router } from 'express';
import { deleteProfile, getProfile, updateProfile, getCurrentProfile, getAllProfiles, getProfileByUserId } from '../controllers/profile';

export const profileRouter = Router();

profileRouter.get('/', getProfile);
profileRouter.put('/', updateProfile);
profileRouter.delete('/', deleteProfile);
profileRouter.get('/me', getCurrentProfile);
profileRouter.get('/all', getAllProfiles);
profileRouter.get('/user/:id', getProfileByUserId);

export default profileRouter;
