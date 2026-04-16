import express from 'express';
import { 
    startInterview, 
    submitAnswer, 
    endInterview, 
    getHistory, 
    getInterviewDetails 
} from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all interview routes
router.use(protect);

// Dashboard routes
router.get('/history', getHistory);
router.get('/:sessionId', getInterviewDetails);

// Action routes
router.post('/start', startInterview);
router.post('/:sessionId/answer', submitAnswer);
router.post('/:sessionId/end', endInterview);

export default router;
