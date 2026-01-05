const express = require('express');
const router = express.Router();
const multer = require('multer');
const { analyzeResume, generateQuestions } = require('../controllers/aiController');

// Configure multer for memory storage (PDF files)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// POST /api/ai/analyze - Analyze PDF resume and generate questions
router.post('/analyze', upload.single('resume'), analyzeResume);

// POST /api/ai/generate - Generate questions from text (legacy endpoint)
router.post('/generate', generateQuestions);

module.exports = router;
