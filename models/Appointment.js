const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Therapist',
    required: true
  },
  startDateTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  sessionType: {
    type: String,
    enum: ['video', 'audio', 'chat'],
    required: true
  },
  notes: {
    type: String
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'refunded'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for efficient querying
appointmentSchema.index({ userId: 1, startDateTime: 1 });
appointmentSchema.index({ therapistId: 1, startDateTime: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment; 