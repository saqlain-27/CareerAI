import mongoose from 'mongoose';

const resumeAnalysisSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        resumeName: {
            type: String,
            required: true,
        },
        jobDescription: {
            type: String, // Optional: if the user wants purely general feedback
        },
        resumeText: {
            type: String,
            required: true, // Crucial for reusability/debugging
        },
        atsScore: {
            type: Number,
            required: true,
        },
        analysis: {
            type: Object, // Structured JSON containing strengths, weaknesses, matching keywords, etc.
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const ResumeAnalysis = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);

export default ResumeAnalysis;
