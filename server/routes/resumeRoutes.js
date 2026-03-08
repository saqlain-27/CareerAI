import express from 'express';
import multer from 'multer';
import { uploadResume, getResumeHistory, getResumeAnalysis } from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Setup Multer to store the uploaded file directly in memory as a buffer.
// We do not save physical files to disk to save space (since we extract and use the text immediately).
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed.'), false);
        }
    }
});

// Protect all resume routes
router.use(protect);

// POST explicitly to /analyze, expecting a form-data field named 'resume'
router.post('/analyze', upload.single('resume'), uploadResume);

router.get('/history', getResumeHistory);
router.get('/history/:id', getResumeAnalysis);

export default router;
