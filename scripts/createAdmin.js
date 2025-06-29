const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mental-wellness';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

async function createOrUpdateAdmin() {
  await mongoose.connect(MONGODB_URI);
  let admin = await User.findOne({ email: ADMIN_EMAIL });
  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
  if (admin) {
    admin.name = ADMIN_NAME;
    admin.password = hashed;
    admin.role = 'admin';
    await admin.save();
    console.log('Admin user updated:', ADMIN_EMAIL);
  } else {
    admin = new User({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: hashed, role: 'admin' });
    await admin.save();
    console.log('Admin user created:', ADMIN_EMAIL);
  }
  process.exit(0);
}

createOrUpdateAdmin(); 