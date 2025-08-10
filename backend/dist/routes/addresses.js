"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Address_1 = __importDefault(require("../models/Address"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const express_validator_1 = require("express-validator");
const router = express_1.default.Router();
// Get user's addresses
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const addresses = await Address_1.default.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
        res.json(addresses);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Get address by ID
router.get('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const address = await Address_1.default.findOne({
            _id: req.params.id,
            user: req.user._id
        });
        if (!address) {
            return res.status(404).json({ error: 'Address not found' });
        }
        res.json(address);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Create new address
router.post('/', auth_1.authenticate, [
    (0, express_validator_1.body)('name').trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('street').trim().isLength({ min: 5 }),
    (0, express_validator_1.body)('city').trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('state').trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('postalCode').trim().isLength({ min: 3 }),
    (0, express_validator_1.body)('country').trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('coordinates.lat').isFloat({ min: -90, max: 90 }),
    (0, express_validator_1.body)('coordinates.lng').isFloat({ min: -180, max: 180 })
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // If this is the first address or marked as default, make it default
        const addressCount = await Address_1.default.countDocuments({ user: req.user._id });
        const isDefault = req.body.isDefault || addressCount === 0;
        // If setting as default, unset other default addresses
        if (isDefault) {
            await Address_1.default.updateMany({ user: req.user._id }, { isDefault: false });
        }
        const address = new Address_1.default({
            user: req.user._id,
            ...req.body,
            isDefault
        });
        await address.save();
        // Update user's addresses array
        await User_1.default.findByIdAndUpdate(req.user._id, { $push: { addresses: address._id } });
        res.status(201).json(address);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Update address
router.put('/:id', auth_1.authenticate, [
    (0, express_validator_1.body)('name').optional().trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('street').optional().trim().isLength({ min: 5 }),
    (0, express_validator_1.body)('city').optional().trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('state').optional().trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('postalCode').optional().trim().isLength({ min: 3 }),
    (0, express_validator_1.body)('country').optional().trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('coordinates.lat').optional().isFloat({ min: -90, max: 90 }),
    (0, express_validator_1.body)('coordinates.lng').optional().isFloat({ min: -180, max: 180 })
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // If setting as default, unset other default addresses
        if (req.body.isDefault) {
            await Address_1.default.updateMany({ user: req.user._id }, { isDefault: false });
        }
        const address = await Address_1.default.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true, runValidators: true });
        if (!address) {
            return res.status(404).json({ error: 'Address not found' });
        }
        res.json(address);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Delete address
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const address = await Address_1.default.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });
        if (!address) {
            return res.status(404).json({ error: 'Address not found' });
        }
        // Remove from user's addresses array
        await User_1.default.findByIdAndUpdate(req.user._id, { $pull: { addresses: address._id } });
        // If deleted address was default, make another address default
        if (address.isDefault) {
            const firstAddress = await Address_1.default.findOne({ user: req.user._id });
            if (firstAddress) {
                firstAddress.isDefault = true;
                await firstAddress.save();
            }
        }
        res.json({ message: 'Address deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Set default address
router.patch('/:id/default', auth_1.authenticate, async (req, res) => {
    try {
        // Unset all default addresses for user
        await Address_1.default.updateMany({ user: req.user._id }, { isDefault: false });
        // Set the specified address as default
        const address = await Address_1.default.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isDefault: true }, { new: true });
        if (!address) {
            return res.status(404).json({ error: 'Address not found' });
        }
        res.json(address);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
