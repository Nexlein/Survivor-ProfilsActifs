import { Router } from 'express';
import { getAllQuestion, getCandidateProgression, saveCandidateProgression, submitQuestionnaire } from '../controllers/questionnaire';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Protect all profile routes with JWT authentication middleware
router.use(authenticateToken);

router.get('/questions', getAllQuestion);
router.get('/progression', getCandidateProgression);
router.post('/progression', saveCandidateProgression);
router.post('/submit', submitQuestionnaire);

export default router;
