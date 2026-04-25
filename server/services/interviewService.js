import InterviewSession from '../models/InterviewSession.js';
import InterviewQuestion from '../models/InterviewQuestion.js';

export const createSession = async (userId, targetRole, jobDescription, experienceLevel) => {
    const session = await InterviewSession.create({
        user: userId,
        targetRole,
        jobDescription,
        experienceLevel,
        status: 'in-progress'
    });
    return session;
};

export const addQuestion = async (sessionId, questionText, questionOrder) => {
    const question = await InterviewQuestion.create({
        interviewSession: sessionId,
        questionText,
        questionOrder
    });
    return question;
};

export const updateAnswerAndFeedback = async (questionId, userAnswer, aiFeedback, score) => {
    const question = await InterviewQuestion.findByIdAndUpdate(
        questionId,
        { userAnswer, aiFeedback, score },
        { new: true }
    );
    return question;
};

export const completeSession = async (sessionId, finalScore, finalFeedback) => {
    const session = await InterviewSession.findByIdAndUpdate(
        sessionId,
        {
            status: 'completed',
            finalScore,
            finalFeedback
        },
        { new: true }
    );
    return session;
};

export const getInterviewHistory = async (userId) => {
    const sessions = await InterviewSession.find({ user: userId })
        .sort({ createdAt: -1 })
        .select('-finalFeedback');
    return sessions;
};

export const getSessionDetails = async (sessionId, userId) => {
    const session = await InterviewSession.findOne({ _id: sessionId, user: userId });

    if (!session) {
        throw new Error('Interview session not found or unauthorized');
    }

    const questions = await InterviewQuestion.find({ interviewSession: sessionId })
        .sort({ questionOrder: 1 });

    return { session, questions };
};
