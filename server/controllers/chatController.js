import { createChat, getUserChats, getChatHistory, addMessage } from '../services/chatService.js';
import { generateResponse } from '../services/aiService.js';

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

export const sendMessage = async (req, res, next) => {
    try {
        const { content } = req.body;
        const chatId = req.params.id;

        if (!content || content.trim() === '') {
            res.status(400);
            throw new Error('Message content cannot be empty');
        }

        const userId = req.user.id || req.user._id;
        const { chat, messages: existingMessages } = await getChatHistory(chatId, userId);

        const userMessage = await addMessage(chatId, 'user', content);

        const fullHistoryForAI = [...existingMessages, userMessage];

        console.log(fullHistoryForAI);

        const aiResponseText = await generateResponse(fullHistoryForAI, chat.mode);

        const aiMessage = await addMessage(chatId, 'assistant', aiResponseText);

        res.status(200).json({
            success: true,
            userMessage,
            aiMessage,
        });
    } catch (error) {
        if (error.message === 'Chat not found or unauthorized') {
            res.status(404);
        } else if (res.statusCode === 200) {
            res.status(500);
        }
        next(error);
    }
};
