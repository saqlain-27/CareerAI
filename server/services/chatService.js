import Chat from '../models/Chat.js';
import Message from '../models/Message.js';

export const createChat = async (userId, title = 'New Chat', mode = 'normal') => {
    const chat = await Chat.create({
        user: userId,
        title,
        mode,
    });
    return chat;
};

export const getUserChats = async (userId) => {
    const chats = await Chat.find({ user: userId }).sort({ updatedAt: -1 });
    return chats;
};

export const getChatHistory = async (chatId, userId) => {
    const chat = await Chat.findOne({ _id: chatId, user: userId });

    if (!chat) {
        throw new Error('Chat not found or unauthorized');
    }

    const messages = await Message.find({ chat: chatId }).sort({ createdAt: 1 });

    return { chat, messages };
};

export const addMessage = async (chatId, role, content) => {
    const message = await Message.create({
        chat: chatId,
        role,
        content,
    });

    // Update the chat's updatedAt timestamp
    await Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() });

    return message;
};
