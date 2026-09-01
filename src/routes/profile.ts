import { Router } from 'express';
import { deleteProfile, getProfile, updateProfile } from '../controllers/profile';

export const profileRouter = Router();

profileRouter.get('/', getProfile);
profileRouter.put('/', updateProfile);
profileRouter.delete('/', deleteProfile);

export default profileRouter;
