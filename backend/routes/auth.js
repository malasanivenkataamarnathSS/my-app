const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const emailService = require('../utils/emailService');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Rate limiting for OTP requests
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 OTP requests per windowMs
    message: {
        success: false,
        message: 'Too many OTP requests, please try again later'
    }
});

// Rate limiting for login attempts
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 login attempts per windowMs
    message: {
        success: false,
        message: 'Too many login attempts, please try again later'
    }
});

// @route   POST /api/auth/send-otp
// @desc    Send OTP to user's email
// @access  Public
router.post('/send-otp', 
    otpLimiter,
    [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address'),
        body('name')
            .optional()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Name must be between 2 and 50 characters')
    ],
    async (req, res) => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { email, name } = req.body;

            // Find or create user
            let user = await User.findOne({ email });
            
            if (!user) {
                // Create new user if doesn't exist
                if (!name) {
                    return res.status(400).json({
                        success: false,
                        message: 'Name is required for new users'
                    });
                }
                
                user = new User({
                    email,
                    name
                });
            }

            // Generate and save OTP
            const otp = await user.generateOTP();

            // Send OTP via email
            try {
                await emailService.sendOTP(email, user.name, otp);
            } catch (emailError) {
                console.error('Email sending error:', emailError);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to send OTP. Please check your email address and try again.'
                });
            }

            res.status(200).json({
                success: true,
                message: 'OTP sent successfully to your email',
                data: {
                    email,
                    expiresIn: `${process.env.OTP_EXPIRE_MINUTES || 10} minutes`
                }
            });

        } catch (error) {
            console.error('Send OTP error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error. Please try again later.'
            });
        }
    }
);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and login user
// @access  Public
router.post('/verify-otp',
    loginLimiter,
    [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address'),
        body('otp')
            .isLength({ min: 6, max: 6 })
            .isNumeric()
            .withMessage('OTP must be a 6-digit number')
    ],
    async (req, res) => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { email, otp } = req.body;

            // Find user
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'User not found. Please request a new OTP.'
                });
            }

            // Verify OTP
            const isValidOTP = user.verifyOTP(otp);
            if (!isValidOTP) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired OTP. Please request a new one.'
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE || '7d' }
            );

            // Prepare user data (exclude sensitive information)
            const userData = {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                gender: user.gender,
                dateOfBirth: user.dateOfBirth,
                isAdmin: user.isAdmin,
                addresses: user.addresses,
                favorites: user.favorites
            };

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: userData,
                    token,
                    expiresIn: process.env.JWT_EXPIRE || '7d'
                }
            });

        } catch (error) {
            console.error('Verify OTP error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error. Please try again later.'
            });
        }
    }
);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('favorites', 'name images basePrice category')
            .select('-otp');

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile',
    auth,
    [
        body('name')
            .optional()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Name must be between 2 and 50 characters'),
        body('phone')
            .optional()
            .isMobilePhone('en-IN')
            .withMessage('Please provide a valid Indian phone number'),
        body('gender')
            .optional()
            .isIn(['male', 'female', 'other'])
            .withMessage('Gender must be male, female, or other'),
        body('dateOfBirth')
            .optional()
            .isISO8601()
            .toDate()
            .withMessage('Please provide a valid date of birth')
    ],
    async (req, res) => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const updates = {};
            const allowedFields = ['name', 'phone', 'gender', 'dateOfBirth'];
            
            allowedFields.forEach(field => {
                if (req.body[field] !== undefined) {
                    updates[field] = req.body[field];
                }
            });

            const user = await User.findByIdAndUpdate(
                req.user._id,
                updates,
                { new: true, runValidators: true }
            ).select('-otp');

            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: user
            });

        } catch (error) {
            console.error('Update profile error:', error);
            
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: Object.values(error.errors).map(e => e.message)
                });
            }
            
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
);

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, (req, res) => {
    // Since we're using JWT, logout is handled on the client side
    // This endpoint can be used for logging purposes
    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
});

// @route   GET /api/auth/health
// @desc    Check auth service health
// @access  Public
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Auth service is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;