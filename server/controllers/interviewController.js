import { createSession, addQuestion, updateAnswerAndFeedback, completeSession, getInterviewHistory, getSessionDetails } from '../services/interviewService.js';
import { generateInterviewQuestion, evaluateInterviewAnswer, generateFinalInterviewSummary } from '../services/aiService.js';

const MAX_QUESTIONS = 5;

export const startInterview = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id;
        const { targetRole, jobDescription, experienceLevel } = req.body;

        if (!targetRole || !experienceLevel) {
            res.status(400);
            throw new Error('Please provide the targetRole and experienceLevel');
        }

        const session = await createSession(userId, targetRole, jobDescription, experienceLevel);

        const questionText = await generateInterviewQuestion(
            targetRole,
            experienceLevel,
            jobDescription,
            [] // No past questions yet
        );

        const firstQuestion = await addQuestion(session._id, questionText, 1);

        res.status(201).json({
            success: true,
            session,
            currentQuestion: firstQuestion
        });
    } catch (error) {
        next(error);
    }
};

export const submitAnswer = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id;
        const { sessionId } = req.params;
        const { questionId, userAnswer } = req.body;

        if (!questionId || !userAnswer) {
            res.status(400);
            throw new Error('Please provide the questionId and userAnswer');
        }

        const { session, questions } = await getSessionDetails(sessionId, userId);

        if (session.status === 'completed') {
            res.status(400);
            throw new Error('This interview session is already completed.');
        }

        const currentQuestion = questions.find(q => q._id.toString() === questionId);
        if (!currentQuestion) {
            res.status(404);
            throw new Error('Question not found in this session.');
        }

        if (currentQuestion.userAnswer) {
            res.status(400);
            throw new Error('You have already answered this question.');
        }

        const { score, aiFeedback } = await evaluateInterviewAnswer(currentQuestion.questionText, userAnswer);

        const updatedQuestion = await updateAnswerAndFeedback(questionId, userAnswer, aiFeedback, score);
        const updatedQuestions = questions.map(q => q._id.toString() === questionId ? updatedQuestion : q);
        const currentOrder = currentQuestion.questionOrder;

        if (currentOrder < MAX_QUESTIONS) {
            const nextQuestionText = await generateInterviewQuestion(
                session.targetRole,
                session.experienceLevel,
                session.jobDescription,
                updatedQuestions
            );

            const nextQuestion = await addQuestion(sessionId, nextQuestionText, currentOrder + 1);

            return res.status(200).json({
                success: true,
                message: 'Answer saved. Next question generated.',
                evaluation: { score, aiFeedback },
                nextQuestion
            });
        } else {
            const summary = await generateFinalInterviewSummary(
                session.targetRole,
                session.experienceLevel,
                updatedQuestions
            );

            const completedSession = await completeSession(
                sessionId,
                summary.finalScore,
                summary.finalFeedback
            );

            return res.status(200).json({
                success: true,
                message: 'Interview completed!',
                evaluation: { score, aiFeedback },
                finalSummary: completedSession
            });
        }
    } catch (error) {
        next(error);
    }
};

export const endInterview = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id;
        const { sessionId } = req.params;

        const { session, questions } = await getSessionDetails(sessionId, userId);

        if (session.status === 'completed') {
            res.status(400);
            throw new Error('Session is already completed.');
        }

        let finalScore = 0;
        let finalFeedback = null;

        const answeredQuestions = questions.filter(q => q.userAnswer && q.userAnswer.trim() !== '');

        if (answeredQuestions.length > 0) {
            const summary = await generateFinalInterviewSummary(
                session.targetRole,
                session.experienceLevel,
                answeredQuestions
            );
            finalScore = summary.finalScore;
            finalFeedback = summary.finalFeedback;
        } else {
            finalFeedback = 'No answers were provided. Please attempt at least one question.';
        }

        const completedSession = await completeSession(sessionId, finalScore, finalFeedback);

        res.status(200).json({
            success: true,
            message: 'Interview formally ended early.',
            session: completedSession
        });
    } catch (error) {
        next(error);
    }
};

export const getHistory = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id;
        const sessions = await getInterviewHistory(userId);

        res.status(200).json({
            success: true,
            count: sessions.length,
            data: sessions
        });
    } catch (error) {
        next(error);
    }
};

export const getInterviewDetails = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id;
        const { sessionId } = req.params;

        const details = await getSessionDetails(sessionId, userId);

        res.status(200).json({
            success: true,
            data: details
        });
    } catch (error) {
        if (error.message === 'Interview session not found or unauthorized') {
            res.status(404);
        }
        next(error);
    }
};
