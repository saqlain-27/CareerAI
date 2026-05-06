import api from './api';

// POST /interview/start → { success, session, currentQuestion }
export const startInterview = async (targetRole, experienceLevel, jobDescription) => {
    try {
        const response = await api.post('/interview/start', {
            targetRole,
            experienceLevel,
            jobDescription,
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to start interview');
    }
};

// POST /interview/:sessionId/answer → { success, evaluation, nextQuestion? | finalSummary? }
export const submitAnswer = async (sessionId, questionId, userAnswer) => {
    try {
        const response = await api.post(`/interview/${sessionId}/answer`, {
            questionId,
            userAnswer,
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to submit answer. The AI may be busy — please try again.');
    }
};

// POST /interview/:sessionId/end → { success, session }
export const endInterview = async (sessionId) => {
    try {
        const response = await api.post(`/interview/${sessionId}/end`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to end interview');
    }
};

// GET /interview/history → { success, count, data: [] }
export const getInterviewHistory = async () => {
    try {
        const response = await api.get('/interview/history');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch interview history');
    }
};

// GET /interview/:sessionId → { success, data: { session, questions } }
export const getInterviewDetails = async (sessionId) => {
    try {
        const response = await api.get(`/interview/${sessionId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch interview details');
    }
};
