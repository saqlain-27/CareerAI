import { createChat, getUserChats, getChatHistory, addMessage } from '../services/chatService.js';
import { generateResponse } from '../services/aiService.js';

// @desc    Create a new chat session
// @route   POST /api/chat
// @access  Private
export const startChat = async (req, res, next) => {
    try {
        const { title, mode } = req.body;
        const userId = req.user.id || req.user._id;
        const chat = await createChat(userId, title, mode);

        res.status(201).json({
            success: true,
            chat,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all chats for logged in user
// @route   GET /api/chat
// @access  Private
export const getAllChats = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id;
        const chats = await getUserChats(userId);

        res.status(200).json({
            success: true,
            count: chats.length,
            chats,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get specific chat history
// @route   GET /api/chat/:id
// @access  Private
export const getChat = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id;
        const { chat, messages } = await getChatHistory(req.params.id, userId);

        res.status(200).json({
            success: true,
            chat,
            messages,
        });
    } catch (error) {
        res.status(404);
        next(error);
    }
};

// @desc    Send a message to a chat and get AI response
// @route   POST /api/chat/:id/message
// @access  Private
export const sendMessage = async (req, res, next) => {
    try {
        const { content } = req.body;
        const chatId = req.params.id;

        if (!content || content.trim() === '') {
            res.status(400);
            throw new Error('Message content cannot be empty');
        }

        // 1. Verify chat exists and belongs to user, get history
        const userId = req.user.id || req.user._id;
        const { chat, messages: existingMessages } = await getChatHistory(chatId, userId);

        // 2. Save User's prompt to DB
        const userMessage = await addMessage(chatId, 'user', content);

        // 3. Prepare full history for AI (existing + new user message)
        const fullHistoryForAI = [...existingMessages, userMessage];

        console.log(fullHistoryForAI);

        // 4. Call AI Service
        const aiResponseText = await generateResponse(fullHistoryForAI, chat.mode);

        // 5. Save AI's response to DB
        const aiMessage = await addMessage(chatId, 'assistant', aiResponseText);

        // 6. Return response to client
        res.status(200).json({
            success: true,
            userMessage,
            aiMessage,
        });
    } catch (error) {
        // If it's a "Chat not found" error, it's a 404
        if (error.message === 'Chat not found or unauthorized') {
            res.status(404);
        } else if (res.statusCode === 200) {
            // Default to 500 for other errors if status isn't already set
            res.status(500);
        }
        next(error);
    }
};
