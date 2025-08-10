"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = __importDefault(require("../models/User"));
const Product_1 = __importDefault(require("../models/Product"));
const auth_1 = require("../middleware/auth");
const express_validator_1 = require("express-validator");
const router = express_1.default.Router();
// Update user profile
router.put('/profile', auth_1.authenticate, [
    (0, express_validator_1.body)('name').optional().trim().isLength({ min: 2 }),
    (0, express_validator_1.body)('gender').optional().isIn(['male', 'female', 'other']),
    (0, express_validator_1.body)('dateOfBirth').optional().isISO8601()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const user = await User_1.default.findByIdAndUpdate(req.user._id, req.body, { new: true, runValidators: true }).select('-otpCode -otpExpires');
        res.json({
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            gender: user.gender,
            dateOfBirth: user.dateOfBirth
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Get user's favorite items
router.get('/favorites', auth_1.authenticate, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user._id).populate('favoriteItems');
        res.json(user.favoriteItems);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Add item to favorites
router.post('/favorites/:productId', auth_1.authenticate, async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        const user = await User_1.default.findById(req.user._id);
        if (user.favoriteItems.includes(req.params.productId)) {
            return res.status(400).json({ error: 'Product already in favorites' });
        }
        user.favoriteItems.push(req.params.productId);
        await user.save();
        res.json({ message: 'Product added to favorites' });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Remove item from favorites
router.delete('/favorites/:productId', auth_1.authenticate, async (req, res) => {
    try {
        const user = await User_1.default.findByIdAndUpdate(req.user._id, { $pull: { favoriteItems: req.params.productId } }, { new: true });
        res.json({ message: 'Product removed from favorites' });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Admin: Get all users
router.get('/admin/all', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        const users = await User_1.default.find(query)
            .select('-otpCode -otpExpires')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
        const total = await User_1.default.countDocuments(query);
        res.json({
            users,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / parseInt(limit)),
                totalUsers: total
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Admin: Update user role
router.patch('/admin/:id/role', auth_1.authenticate, auth_1.requireAdmin, [
    (0, express_validator_1.body)('role').isIn(['user', 'admin'])
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const user = await User_1.default.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-otpCode -otpExpires');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
