const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const Appointment = require('../models/Appointment');

// Get all appointments for the logged-in user or therapist
router.get('/', auth, async function(req, res) {
  try {
    let query = {};
    if (req.user) {
      // User: show their appointments
      query.userId = req.user.id;
    } else if (req.therapist) {
      // Therapist: show appointments assigned to them
      query.therapistId = req.therapist.id;
    } else {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const appointments = await Appointment.find(query)
      .populate('therapistId', 'name specialization')
      .populate('userId', 'name email')
      .sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new appointment
router.post('/', auth, async function(req, res) {
  try {
    const { therapistId, startDateTime, sessionType, notes } = req.body;

    const appointment = new Appointment({
      userId: req.user.id,
      therapistId,
      startDateTime,
      sessionType,
      notes,
      status: 'pending'
    });

    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update an appointment
router.put('/:id', auth, async function(req, res) {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Authorization: user or therapist
    if (req.user && appointment.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    if (req.therapist && appointment.therapistId.toString() !== req.therapist._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { startDateTime, sessionType, notes, status } = req.body;
    
    appointment.startDateTime = startDateTime || appointment.startDateTime;
    appointment.sessionType = sessionType || appointment.sessionType;
    appointment.notes = notes || appointment.notes;
    appointment.status = status || appointment.status;

    await appointment.save();
    res.json(appointment);
  } catch (err) {
    console.error('Error updating appointment:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel an appointment
router.delete('/:id', auth, async function(req, res) {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Authorization: user or therapist
    if (req.user && appointment.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    if (req.therapist && appointment.therapistId.toString() !== req.therapist._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await appointment.deleteOne();
    res.json({ message: 'Appointment cancelled' });
  } catch (err) {
    console.error('Error cancelling appointment:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept an appointment
router.put('/:id/accept', auth, async function(req, res) {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.therapistId.toString() !== req.therapist._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    appointment.status = 'confirmed';
    await appointment.save();

    // Send notification to user
    // This is a placeholder. You can implement your notification logic here.
    console.log(`Notification sent to user ${appointment.userId}: Appointment accepted.`);

    res.json(appointment);
  } catch (err) {
    console.error('Error accepting appointment:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all appointments
router.get('/admin/all', adminAuth, async (req, res) => {
  const appointments = await Appointment.find({})
    .populate('therapistId', 'name specialization')
    .populate('userId', 'name email')
    .sort({ startDateTime: 1 });
  res.json(appointments);
});

// Admin: Update appointment
router.put('/admin/:id', adminAuth, async (req, res) => {
  const { startDateTime, sessionType, notes, status } = req.body;
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
  if (startDateTime) appointment.startDateTime = startDateTime;
  if (sessionType) appointment.sessionType = sessionType;
  if (notes) appointment.notes = notes;
  if (status) appointment.status = status;
  await appointment.save();
  res.json(appointment);
});

// Admin: Delete appointment
router.delete('/admin/:id', adminAuth, async (req, res) => {
  const appointment = await Appointment.findByIdAndDelete(req.params.id);
  if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
  res.json({ message: 'Appointment deleted' });
});

module.exports = router; 