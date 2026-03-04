import express from 'express';
import { startChat, getAllChats, getChat, sendMessage } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting specifically for message generation to prevent API abuse
const messageLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 messages per windowMs
    message: { success: false, message: 'Too many messages sent, please try again after a minute' }
});

// Protect all chat routes with authentication middleware
router.use(protect);

router.post('/', startChat);
router.get('/', getAllChats);
router.get('/:id', getChat);
router.post('/:id/message', messageLimiter, sendMessage);

export default router;
