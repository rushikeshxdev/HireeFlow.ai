const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['technical', 'behavioral', 'coding', 'system-design', 'general'],
    default: 'technical'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  isAsked: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  notes: String
});

const codeSnapshotSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: 'javascript'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const interviewSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  interviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  candidate: {
    name: {
      type: String,
      required: true
    },
    email: String,
    resumeText: String,
    resumeFileName: String
  },
  jobRole: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  questions: [questionSchema],
  codeSnapshots: [codeSnapshotSchema],
  finalCode: {
    type: String
  },
  startTime: Date,
  endTime: Date,
  duration: Number, // in minutes
  feedback: {
    overallRating: {
      type: Number,
      min: 1,
      max: 5
    },
    technicalSkills: {
      type: Number,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    problemSolving: {
      type: Number,
      min: 1,
      max: 5
    },
    notes: String,
    recommendation: {
      type: String,
      enum: ['strong-hire', 'hire', 'no-hire', 'strong-no-hire', 'pending']
    }
  },
  metadata: {
    browserInfo: String,
    connectionQuality: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
interviewSchema.index({ interviewer: 1, createdAt: -1 });
interviewSchema.index({ status: 1 });

// Calculate duration when interview ends
interviewSchema.methods.endInterview = async function() {
  this.endTime = new Date();
  this.status = 'completed';
  if (this.startTime) {
    this.duration = Math.round((this.endTime - this.startTime) / 60000); // Convert to minutes
  }
  await this.save();
};

// Start interview
interviewSchema.methods.startInterview = async function() {
  this.startTime = new Date();
  this.status = 'in-progress';
  await this.save();
};

module.exports = mongoose.model('Interview', interviewSchema);
