const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const ChatMessage = require('./models/ChatMessage');
const User = require('./models/User');
const Therapist = require('./models/Therapist');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mental-wellness')
  .then(() => {
    console.log('Connected to MongoDB');
    // Verify Therapist model
    console.log('Therapist model loaded:', !!Therapist);
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if cannot connect to database
  });

// Routes
console.log('Loading routes...');
app.use('/api/auth', require('./routes/auth'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/therapists', require('./routes/therapists'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/chat', require('./routes/chat'));
console.log('Routes loaded');

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server with socket.io
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Socket.io authentication and events
io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('No token'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (decoded.role === 'therapist') {
      const therapist = await Therapist.findById(decoded.userId);
      if (!therapist) return next(new Error('Therapist not found'));
      socket.user = { id: therapist._id.toString(), role: 'therapist', name: therapist.name };
    } else {
      const user = await User.findById(decoded.userId);
      if (!user) return next(new Error('User not found'));
      socket.user = { id: user._id.toString(), role: user.role, name: user.name };
    }
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  // Join a room for this user/therapist
  socket.join(`${socket.user.role}:${socket.user.id}`);

  socket.on('send_message', async (data) => {
    const { receiverId, receiverRole, message } = data;
    if (!receiverId || !receiverRole || !message) return;
    try {
      // Save message to DB
      const chatMessage = new ChatMessage({
        sender: { id: socket.user.id, role: socket.user.role },
        receiver: { id: receiverId, role: receiverRole },
        message
      });
      await chatMessage.save();
      console.log('Chat message saved:', chatMessage);
      // Emit to receiver (if online)
      io.to(`${receiverRole}:${receiverId}`).emit('receive_message', chatMessage);
      // Emit to sender (for instant UI update)
      socket.emit('receive_message', chatMessage);
    } catch (err) {
      console.error('Error saving chat message:', err);
      socket.emit('error', { message: 'Failed to save message.' });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 