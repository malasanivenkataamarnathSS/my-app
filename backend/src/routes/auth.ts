import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { generateOTP, sendOTPEmail } from '../utils/email';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Send OTP
router.post('/send-otp', [
  body('email').isEmail().normalizeEmail(),
  body('name').optional().trim().isLength({ min: 2 })
], async (req: any, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name } = req.body;
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let user = await User.findOne({ email });
    
    if (!user) {
      user = new User({
        email,
        name: name || 'User',
        otpCode: otp,
        otpExpires,
        isVerified: false
      });
    } else {
      user.otpCode = otp;
      user.otpExpires = otpExpires;
      if (name) user.name = name;
    }

    await user.save();

    const emailSent = await sendOTPEmail(email, otp, user.name);
    
    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send OTP email' });
    }

    res.json({ 
      message: 'OTP sent successfully',
      email: email
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify OTP and login
router.post('/verify-otp', [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric()
], async (req: any, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp } = req.body;

    const user = await User.findOne({ 
      email,
      otpExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const isValidOTP = await user.comparePassword(otp);
    
    if (!isValidOTP) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Clear OTP and mark as verified
    user.otpCode = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      addresses: user.addresses,
      favoriteItems: user.favoriteItems
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;