const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Therapist = require('../models/Therapist');

const auth = async function(req, res, next) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    //console.log('Decoded token:', decoded); // Debug log
    let user = null;
    if (decoded.role === 'therapist') {
      user = await Therapist.findById(decoded.userId);
      //console.log('Found therapist:', user); // Debug log
      if (!user) {
        return res.status(401).json({ message: 'Therapist not found' });
      }
      req.therapist = user;
    } else {
      user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      req.user = user;
    }
    next();
  } catch (err) {
    console.error('Auth middleware error:', err); // Debug log
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    next();
  };
};

module.exports = { auth, checkRole };