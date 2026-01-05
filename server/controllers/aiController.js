const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');

// Lazy initialization of Gemini AI
let genAI = null;

console.log('========== AI CONTROLLER LOADED ==========');
console.log('API Key present:', !!process.env.GEMINI_API_KEY);
console.log('Key preview:', process.env.GEMINI_API_KEY?.substring(0, 5) || 'NOT SET');
console.log('===========================================');

/**
 * Initialize Gemini AI client
 */
const initializeAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

/**
 * Clean AI response - remove markdown code blocks
 */
const cleanJsonResponse = (text) => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
};

/**
 * Analyze PDF Resume and Generate Interview Questions
 * POST /api/ai/analyze
 * Expects: multipart/form-data with 'resume' file and 'jobRole' field
 */
const analyzeResume = async (req, res) => {
  try {
    console.log('--- Resume Analysis Request ---');

    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      return res.status(401).json({
        error: 'API Configuration Error',
        message: 'Gemini API key not configured. Check server/.env file.'
      });
    }

    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload a PDF resume file.'
      });
    }

    // Validate file type
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({
        error: 'Invalid file type',
        message: 'Only PDF files are accepted.'
      });
    }

    const jobRole = req.body.jobRole || 'Software Engineer';
    console.log('Job Role:', jobRole);
    console.log('File size:', req.file.size, 'bytes');

    // Parse PDF to text
    let resumeText;
    try {
      const pdfData = await pdfParse(req.file.buffer);
      resumeText = pdfData.text;
      console.log('PDF parsed successfully, text length:', resumeText.length);
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError);
      return res.status(400).json({
        error: 'PDF parsing failed',
        message: 'Could not extract text from PDF. Ensure the file is a valid PDF.'
      });
    }

    // Validate extracted text
    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({
        error: 'Insufficient content',
        message: 'Could not extract enough text from the PDF. The file may be image-based or empty.'
      });
    }

    // Initialize AI
    const ai = initializeAI();
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Construct the prompt
    const prompt = `You are an expert technical interviewer conducting an interview for the role of "${jobRole}".

Analyze the following resume and generate 5 distinct, challenging technical interview questions tailored to this candidate's experience and skills.

RESUME CONTENT:
${resumeText.substring(0, 4000)}

REQUIREMENTS:
1. Questions must be specific to skills/technologies mentioned in the resume
2. Include a mix: 2 conceptual, 2 practical/coding, 1 system design or architecture
3. Difficulty distribution: 2 medium, 2 hard, 1 expert
4. Questions should probe deep understanding, not surface-level knowledge
5. Make questions relevant to the "${jobRole}" role

IMPORTANT: Return ONLY valid JSON array with no additional text. Use this exact format:
[
  {
    "question": "The interview question",
    "context": "Why this question is relevant based on their resume",
    "difficulty": "medium|hard|expert",
    "skill": "The specific skill being tested",
    "type": "conceptual|practical|system-design"
  }
]`;

    // Generate questions
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = cleanJsonResponse(response.text());

    // Parse JSON response
    let questions;
    try {
      questions = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse AI response:', text.substring(0, 500));
      return res.status(500).json({
        error: 'AI response parsing failed',
        message: 'The AI returned an invalid format. Please try again.'
      });
    }

    // Validate response structure
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(500).json({
        error: 'Invalid response format',
        message: 'Expected an array of questions from AI.'
      });
    }

    console.log('Generated', questions.length, 'questions successfully');

    res.json({
      success: true,
      questions,
      metadata: {
        jobRole,
        candidateName: extractName(resumeText),
        questionCount: questions.length,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('========== RESUME ANALYSIS ERROR ==========');
    console.error('Error:', error.message);
    console.error('============================================');

    if (error.message?.includes('API_KEY') || error.message?.includes('API key')) {
      return res.status(401).json({
        error: 'API Configuration Error',
        message: 'Invalid Gemini API key.'
      });
    }

    if (error.message?.includes('quota') || error.message?.includes('limit')) {
      return res.status(429).json({
        error: 'Rate Limit',
        message: 'API quota exceeded. Try again later.'
      });
    }

    res.status(500).json({
      error: 'Analysis failed',
      message: error.message || 'An unexpected error occurred'
    });
  }
};

/**
 * Generate questions from text input (legacy endpoint)
 * POST /api/ai/generate
 */
const generateQuestions = async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(401).json({
        error: 'API Configuration Error',
        message: 'Gemini API key not configured.'
      });
    }

    const { resumeText, jobRole } = req.body;

    if (!resumeText || !jobRole) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Both resumeText and jobRole are required'
      });
    }

    const ai = initializeAI();
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are an expert technical interviewer. Generate 5 technical interview questions for the role of "${jobRole}" based on this candidate's background:

${resumeText}

Return ONLY a valid JSON array:
[
  {
    "question": "The interview question",
    "context": "Why this question is relevant",
    "difficulty": "medium|hard|expert",
    "skill": "Skill being tested"
  }
]`;

    const result = await model.generateContent(prompt);
    const text = cleanJsonResponse(result.response.text());
    const questions = JSON.parse(text);

    res.json({
      success: true,
      questions,
      metadata: { jobRole, count: questions.length, generatedAt: new Date().toISOString() }
    });

  } catch (error) {
    console.error('Generate Questions Error:', error.message);
    res.status(500).json({
      error: 'Failed to generate questions',
      message: error.message
    });
  }
};

/**
 * Extract candidate name from resume text (simple heuristic)
 */
const extractName = (text) => {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    // If first line looks like a name (short, no special chars)
    if (firstLine.length < 50 && /^[A-Za-z\s.]+$/.test(firstLine)) {
      return firstLine;
    }
  }
  return 'Candidate';
};

module.exports = {
  analyzeResume,
  generateQuestions
};
