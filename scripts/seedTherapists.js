const mongoose = require('mongoose');
const Therapist = require('../models/Therapist');
require('dotenv').config();

const therapistData = [
  {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@example.com',
    password: 'password123', // In production, this should be hashed
    specialization: ['Anxiety', 'Depression'],
    bio: 'Experienced therapist specializing in anxiety and depression treatment.',
    experience: 10,
    rating: 4.8,
    availability: [
      {
        day: 'Monday',
        slots: [
          { startTime: '09:00', endTime: '17:00' }
        ]
      },
      {
        day: 'Wednesday',
        slots: [
          { startTime: '09:00', endTime: '17:00' }
        ]
      }
    ]
  },
  {
    name: 'Dr. Michael Chen',
    email: 'michael.chen@example.com',
    password: 'password123', // In production, this should be hashed
    specialization: ['Stress Management', 'Relationships'],
    bio: 'Dedicated to helping individuals manage stress and improve relationships.',
    experience: 8,
    rating: 4.9,
    availability: [
      {
        day: 'Tuesday',
        slots: [
          { startTime: '10:00', endTime: '18:00' }
        ]
      },
      {
        day: 'Thursday',
        slots: [
          { startTime: '10:00', endTime: '18:00' }
        ]
      }
    ]
  },
  {
    name: 'Dr. Priya Singh',
    email: 'priya.singh@example.com',
    password: 'password123',
    specialization: ['Child Therapy', 'Family Counseling'],
    bio: 'Helping children and families thrive through compassionate counseling.',
    experience: 12,
    rating: 4.7,
    availability: [
      { day: 'Friday', slots: [{ startTime: '08:00', endTime: '16:00' }] }
    ]
  },
  {
    name: 'Dr. Emily Carter',
    email: 'emily.carter@example.com',
    password: 'password123',
    specialization: ['PTSD', 'Trauma Recovery'],
    bio: 'Specialist in trauma recovery and PTSD support for all ages.',
    experience: 15,
    rating: 4.95,
    availability: [
      { day: 'Monday', slots: [{ startTime: '11:00', endTime: '19:00' }] },
      { day: 'Thursday', slots: [{ startTime: '11:00', endTime: '19:00' }] }
    ]
  },
  {
    name: 'Dr. Ahmed Al-Farsi',
    email: 'ahmed.alfarsi@example.com',
    password: 'password123',
    specialization: ['Addiction', 'Behavioral Therapy'],
    bio: 'Focused on addiction recovery and behavioral therapy for adults.',
    experience: 9,
    rating: 4.6,
    availability: [
      { day: 'Wednesday', slots: [{ startTime: '13:00', endTime: '20:00' }] }
    ]
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mental-wellness');
    console.log('Connected to MongoDB');

    // Clear existing therapists
    await Therapist.deleteMany({});
    console.log('Cleared existing therapists');

    // Insert new therapists
    for (const data of therapistData) {
      const therapist = new Therapist(data);
      await therapist.save();
    }
    console.log('Added sample therapists');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 