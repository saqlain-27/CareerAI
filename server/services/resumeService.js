import ResumeAnalysis from '../models/ResumeAnalysis.js';

export const saveAnalysis = async (userId, resumeName, jobDescription, resumeText, atsScore, analysisObject) => {
    const analysis = await ResumeAnalysis.create({
        user: userId,
        resumeName,
        jobDescription,
        resumeText,
        atsScore,
        analysis: analysisObject,
    });
    return analysis;
};

export const getUserAnalyses = async (userId) => {
    const analyses = await ResumeAnalysis.find({ user: userId })
        .sort({ createdAt: -1 })
        .select('-resumeText');
    return analyses;
};

export const getAnalysisById = async (analysisId, userId) => {
    const analysis = await ResumeAnalysis.findOne({ _id: analysisId, user: userId });

    if (!analysis) {
        throw new Error('Resume analysis not found or unauthorized');
    }

    return analysis;
};
