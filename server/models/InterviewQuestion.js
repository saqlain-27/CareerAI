import mongoose from 'mongoose';

const interviewQuestionSchema = mongoose.Schema(
    {
        interviewSession: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'InterviewSession',
        },
        questionText: {
            type: String,
            required: true,
        },
        questionOrder: {
            type: Number,
            required: true,
        },
        userAnswer: {
            type: String,
        },
        aiFeedback: {
            type: String,
        },
        score: {
            type: Number, // 1-10 rating for this specific answer
        },
    },
    {
        timestamps: true,
    }
);

const InterviewQuestion = mongoose.model('InterviewQuestion', interviewQuestionSchema);

export default InterviewQuestion;
