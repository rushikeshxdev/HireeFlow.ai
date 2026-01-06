const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Generate unique room ID
const generateRoomId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let roomId = '';
  for (let i = 0; i < 6; i++) {
    roomId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return roomId;
};

// @route   POST /api/interviews
// @desc    Create a new interview
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { candidateName, candidateEmail, jobRole, resumeText, resumeFileName } = req.body;

    // Generate unique room ID
    let roomId = generateRoomId();
    let existingRoom = await Interview.findOne({ roomId });
    while (existingRoom) {
      roomId = generateRoomId();
      existingRoom = await Interview.findOne({ roomId });
    }

    // Create interview
    const interview = await Interview.create({
      roomId,
      interviewer: req.user._id,
      candidate: {
        name: candidateName,
        email: candidateEmail,
        resumeText,
        resumeFileName
      },
      jobRole
    });

    // Increment user's interview count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { interviewsCreated: 1 }
    });

    res.status(201).json({
      success: true,
      data: interview
    });
  } catch (error) {
    console.error('Create interview error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

// @route   GET /api/interviews
// @desc    Get all interviews for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const interviews = await Interview.find({ interviewer: req.user._id })
      .sort({ createdAt: -1 })
      .select('-codeSnapshots -candidate.resumeText');

    res.json({
      success: true,
      count: interviews.length,
      data: interviews
    });
  } catch (error) {
    console.error('Get interviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   GET /api/interviews/:roomId
// @desc    Get interview by room ID
// @access  Private (or public for candidates)
router.get('/:roomId', async (req, res) => {
  try {
    const interview = await Interview.findOne({ roomId: req.params.roomId })
      .populate('interviewer', 'name email company');

    if (!interview) {
      return res.status(404).json({
        success: false,
        error: 'Interview not found'
      });
    }

    res.json({
      success: true,
      data: interview
    });
  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   PUT /api/interviews/:roomId/start
// @desc    Start an interview
// @access  Private
router.put('/:roomId/start', protect, async (req, res) => {
  try {
    const interview = await Interview.findOne({ roomId: req.params.roomId });

    if (!interview) {
      return res.status(404).json({
        success: false,
        error: 'Interview not found'
      });
    }

    await interview.startInterview();

    res.json({
      success: true,
      data: interview
    });
  } catch (error) {
    console.error('Start interview error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   PUT /api/interviews/:roomId/end
// @desc    End an interview
// @access  Private
router.put('/:roomId/end', protect, async (req, res) => {
  try {
    const { feedback, finalCode } = req.body;

    const interview = await Interview.findOne({ roomId: req.params.roomId });

    if (!interview) {
      return res.status(404).json({
        success: false,
        error: 'Interview not found'
      });
    }

    // Update feedback if provided
    if (feedback) {
      interview.feedback = feedback;
    }

    // Save final code
    if (finalCode) {
      interview.finalCode = finalCode;
    }

    await interview.endInterview();

    res.json({
      success: true,
      data: interview
    });
  } catch (error) {
    console.error('End interview error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   PUT /api/interviews/:roomId/questions
// @desc    Add questions to interview
// @access  Private
router.put('/:roomId/questions', protect, async (req, res) => {
  try {
    const { questions } = req.body;

    const interview = await Interview.findOneAndUpdate(
      { roomId: req.params.roomId },
      { $push: { questions: { $each: questions } } },
      { new: true }
    );

    if (!interview) {
      return res.status(404).json({
        success: false,
        error: 'Interview not found'
      });
    }

    res.json({
      success: true,
      data: interview.questions
    });
  } catch (error) {
    console.error('Add questions error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   PUT /api/interviews/:roomId/code
// @desc    Save code snapshot
// @access  Public (for real-time sync)
router.put('/:roomId/code', async (req, res) => {
  try {
    const { code, language } = req.body;

    const interview = await Interview.findOneAndUpdate(
      { roomId: req.params.roomId },
      {
        $push: {
          codeSnapshots: {
            code,
            language,
            timestamp: new Date()
          }
        }
      },
      { new: true }
    );

    if (!interview) {
      return res.status(404).json({
        success: false,
        error: 'Interview not found'
      });
    }

    res.json({
      success: true,
      message: 'Code snapshot saved'
    });
  } catch (error) {
    console.error('Save code error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   DELETE /api/interviews/:roomId
// @desc    Delete an interview
// @access  Private
router.delete('/:roomId', protect, async (req, res) => {
  try {
    const interview = await Interview.findOneAndDelete({
      roomId: req.params.roomId,
      interviewer: req.user._id
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        error: 'Interview not found'
      });
    }

    res.json({
      success: true,
      message: 'Interview deleted'
    });
  } catch (error) {
    console.error('Delete interview error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
