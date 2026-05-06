import { extractTextFromPDF } from '../services/fileExtractorService.js';
import { analyzeResume } from '../services/aiService.js';
import { saveAnalysis, getUserAnalyses, getAnalysisById, deleteAnalysisById } from '../services/resumeService.js';

export const uploadResume = async (req, res, next) => {
    try {
        // 1. Check if a file was uploaded via Multer
        if (!req.file) {
            res.status(400);
            throw new Error('Please upload a resume file (PDF)');
        }

        const userId = req.user.id || req.user._id;
        const resumeName = req.file.originalname;
        const { jobDescription } = req.body;

        // 2. Extract raw text from the uploaded PDF buffer
        const resumeText = await extractTextFromPDF(req.file.buffer);

        if (!resumeText || resumeText.trim().length === 0) {
            res.status(400);
            throw new Error('Could not extract any text from the uploaded PDF. Please ensure it is a valid text-based PDF.');
        }

        const aiResult = await analyzeResume(resumeText, jobDescription);

        const analysisRecord = await saveAnalysis(
            userId,
            resumeName,
            jobDescription,
            resumeText,
            aiResult.atsScore,
            aiResult.analysis
        );

        res.status(201).json({
            success: true,
            data: analysisRecord
        });
    } catch (error) {
        if (error.statusCode) {
            res.status(error.statusCode);
        }
        next(error);
    }
};

export const getResumeHistory = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id;
        const analyses = await getUserAnalyses(userId);

        res.status(200).json({
            success: true,
            count: analyses.length,
            data: analyses
        });
    } catch (error) {
        next(error);
    }
};

export const getResumeAnalysis = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id;
        const analysisId = req.params.id;

        const analysis = await getAnalysisById(analysisId, userId);

        res.status(200).json({
            success: true,
            data: analysis
        });
    } catch (error) {
        if (error.message === 'Resume analysis not found or unauthorized') {
            res.status(404);
        }
        next(error);
    }
};

export const deleteResumeAnalysis = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id;
        const analysisId = req.params.id;

        const deletedAnalysis = await deleteAnalysisById(analysisId, userId);

        res.status(200).json({
            success: true,
            message: 'Resume analysis deleted successfully',
            data: deletedAnalysis
        });
    } catch (error) {
        if (error.message === 'Resume analysis not found or unauthorized') {
            res.status(404);
        }
        next(error);
    }
};
