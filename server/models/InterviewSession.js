import mongoose from 'mongoose';

const interviewSessionSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        targetRole: {
            type: String,
            required: true,
        },
        jobDescription: {
            type: String,
        },
        experienceLevel: {
            type: String,
            required: true, // e.g., 'Entry', 'Mid', 'Senior'
        },
        status: {
            type: String,
            enum: ['in-progress', 'completed'],
            default: 'in-progress',
        },
        finalScore: {
            type: Number,
        },
        finalFeedback: {
            type: Object, // Structured JSON containing strengths, weaknesses, overall analysis
        },
    },
    {
        timestamps: true,
    }
);

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);

export default InterviewSession;
