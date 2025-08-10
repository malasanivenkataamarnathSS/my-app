"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const email_1 = require("../utils/email");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Send OTP
router.post('/send-otp', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('name').optional().trim().isLength({ min: 2 })
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, name } = req.body;
        const otp = (0, email_1.generateOTP)();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        let user = await User_1.default.findOne({ email });
        if (!user) {
            user = new User_1.default({
                email,
                name: name || 'User',
                otpCode: otp,
                otpExpires,
                isVerified: false
            });
        }
        else {
            user.otpCode = otp;
            user.otpExpires = otpExpires;
            if (name)
                user.name = name;
        }
        await user.save();
        const emailSent = await (0, email_1.sendOTPEmail)(email, otp, user.name);
        if (!emailSent) {
            return res.status(500).json({ error: 'Failed to send OTP email' });
        }
        res.json({
            message: 'OTP sent successfully',
            email: email
        });
    }
    catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// Verify OTP and login
router.post('/verify-otp', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('otp').isLength({ min: 6, max: 6 }).isNumeric()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, otp } = req.body;
        const user = await User_1.default.findOne({
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
        const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
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
    }
    catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// Get current user
router.get('/me', auth_1.authenticate, async (req, res) => {
    try {
        const user = req.user;
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
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Logout (client-side token removal)
router.post('/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});
exports.default = router;
