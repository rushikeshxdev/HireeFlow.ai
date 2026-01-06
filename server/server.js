// CRITICAL: Load dotenv FIRST before any other imports
require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');

// Import Routes
const aiRoutes = require('./routes/aiRoutes');
const authRoutes = require('./routes/authRoutes');
const interviewRoutes = require('./routes/interviewRoutes');

// Debug: Verify env vars loaded
console.log('========== SERVER STARTUP ==========');
console.log('GEMINI_API_KEY loaded:', !!process.env.GEMINI_API_KEY);
console.log('MONGODB_URI loaded:', !!process.env.MONGODB_URI);
console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET);
console.log('=====================================');

// Connect to MongoDB
if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('<username>')) {
  connectDB();
} else {
  console.log('⚠️  MongoDB URI not configured. Database features disabled.');
  console.log('   Set MONGODB_URI in .env to enable database features.');
}

const app = express();
const server = http.createServer(app);

// CORS configuration for frontend (localhost + Vercel deployment)
const ALLOWED_ORIGINS = [
  /^http:\/\/localhost:\d+$/,  // Local development
  'https://hiree-flow-ai.vercel.app',  // Vercel deployment
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) {
      callback(null, true);
      return;
    }
    // Check if origin matches allowed patterns
    const isAllowed = ALLOWED_ORIGINS.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Initialize Socket.io with CORS config
const io = new Server(server, {
  cors: corsOptions
});

// Track users in rooms for WebRTC signaling
const roomUsers = new Map();
// Track interviewer per room (only one allowed)
const roomInterviewers = new Map();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a room with role validation
  socket.on('join-room', ({ roomId, role, name }) => {
    socket.join(roomId);

    // Get existing users in room BEFORE adding new user
    const existingUsers = [...(roomUsers.get(roomId) || [])];

    // Validate and assign role
    let assignedRole = role;
    const currentInterviewer = roomInterviewers.get(roomId);

    if (role === 'interviewer') {
      if (currentInterviewer && currentInterviewer !== socket.id) {
        // Room already has an interviewer, force this user to be candidate
        assignedRole = 'candidate';
        console.log(`Room ${roomId} already has interviewer. ${socket.id} assigned as candidate.`);
      } else {
        // Assign as interviewer
        roomInterviewers.set(roomId, socket.id);
        console.log(`${socket.id} is now the interviewer for room ${roomId}`);
      }
    }

    // Track user in room
    if (!roomUsers.has(roomId)) {
      roomUsers.set(roomId, []);
    }
    roomUsers.get(roomId).push(socket.id);

    console.log(`User ${socket.id} (${name}) joined room ${roomId} as ${assignedRole}`);
    console.log(`Existing users in room: ${existingUsers.length}`);

    // Send role confirmation and existing users to the new user
    socket.emit('room-joined', {
      assignedRole,
      existingUsers,
      isInterviewerTaken: currentInterviewer && currentInterviewer !== socket.id
    });

    // Send existing users list (for backward compatibility)
    socket.emit('room-users', existingUsers);

    // Notify existing users about new user with their role
    socket.to(roomId).emit('user-joined', { odId: socket.id, odName: name, odRole: assignedRole });
  });

  // WebRTC signaling: Relay call offer
  socket.on('call-user', ({ userToCall, signalData, from, name }) => {
    console.log('📞 ========== CALL-USER EVENT ==========');
    console.log('From:', from);
    console.log('To:', userToCall);
    console.log('Caller Name:', name);
    console.log('Signal present:', !!signalData);
    console.log('=========================================');

    io.to(userToCall).emit('call-incoming', {
      signal: signalData,
      from,
      name
    });
    console.log('📞 call-incoming emitted to:', userToCall);
  });

  // WebRTC signaling: Relay call answer
  socket.on('answer-call', ({ signal, to }) => {
    console.log('✅ ========== ANSWER-CALL EVENT ==========');
    console.log('Answering to:', to);
    console.log('Signal present:', !!signal);
    console.log('==========================================');

    io.to(to).emit('call-accepted', signal);
    console.log('✅ call-accepted emitted to:', to);
  });

  // Code editor sync: Broadcast code changes to room
  socket.on('code-change', ({ roomId, code, language }) => {
    console.log(`📝 Code change in room ${roomId} from ${socket.id} (${code.length} chars)`);
    socket.to(roomId).emit('code-update', { code, language });
  });

  // Handle cursor position sync (optional enhancement)
  socket.on('cursor-move', ({ roomId, cursor, userId }) => {
    socket.to(roomId).emit('cursor-update', { cursor, userId });
  });

  // Language change sync
  socket.on('language-change', ({ roomId, language }) => {
    console.log(`🔧 Language changed to ${language} in room ${roomId}`);
    socket.to(roomId).emit('language-update', language);
  });

  // Chat message handling (StreamConnect feature)
  socket.on('send-message', (data) => {
    console.log('💬 Message received:', data);
    // Broadcast message to all users in the room
    io.to(data.roomId).emit('receive-message', {
      sender: data.sender,
      text: data.text,
      timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);

    // Clean up user from all rooms
    roomUsers.forEach((users, roomId) => {
      const index = users.indexOf(socket.id);
      if (index !== -1) {
        users.splice(index, 1);
        socket.to(roomId).emit('user-left', socket.id);

        // If interviewer left, clear the interviewer for this room
        if (roomInterviewers.get(roomId) === socket.id) {
          roomInterviewers.delete(roomId);
          console.log(`Interviewer left room ${roomId}`);
        }
      }

      // Remove empty rooms
      if (users.length === 0) {
        roomUsers.delete(roomId);
        roomInterviewers.delete(roomId);
      }
    });
  });
});

// API Routes
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Multer error handling middleware
app.use((err, req, res, next) => {
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'PDF file must be less than 5MB'
      });
    }
    return res.status(400).json({
      error: 'Upload error',
      message: err.message
    });
  }

  if (err.message === 'Only PDF files are allowed') {
    return res.status(400).json({
      error: 'Invalid file type',
      message: 'Only PDF files are accepted'
    });
  }

  // General error handling
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5002;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready for connections`);
});
