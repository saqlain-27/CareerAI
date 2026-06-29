import express from 'express';
import { startInterview, submitAnswer, endInterview, getHistory, getInterviewDetails, deleteInterviewSession } from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/history', getHistory);
router.get('/:sessionId', getInterviewDetails);
router.delete('/:sessionId', deleteInterviewSession);

router.post('/start', startInterview);
router.post('/:sessionId/answer', submitAnswer);
router.post('/:sessionId/end', endInterview);

export default router;
