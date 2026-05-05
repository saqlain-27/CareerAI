import api from './api';

// Start a new chat session
export const startNewChat = async (title, mode) => {
    try {
        const response = await api.post('/chat', { title, mode });
        return response.data.chat;
    } catch (error) {
        console.error('Error starting new chat:', error);
        throw error;
    }
};

// Get all chat history for the user
export const getAllChats = async () => {
    try {
        const response = await api.get('/chat');
        return response.data.chats;
    } catch (error) {
        console.error('Error fetching chats:', error);
        throw error;
    }
};

// Get a specific chat and its messages
export const getChatHistory = async (chatId) => {
    try {
        const response = await api.get(`/chat/${chatId}`);
        return {
            chat: response.data.chat,
            messages: response.data.messages
        };
    } catch (error) {
        console.error('Error fetching chat history:', error);
        throw error;
    }
};

// Send a message to an existing chat
export const sendMessage = async (chatId, content) => {
    try {
        const response = await api.post(`/chat/${chatId}/message`, { content });
        return {
            userMessage: response.data.userMessage,
            aiMessage: response.data.aiMessage
        };
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};
