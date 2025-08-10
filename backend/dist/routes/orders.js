"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Order_1 = __importDefault(require("../models/Order"));
const Product_1 = __importDefault(require("../models/Product"));
const auth_1 = require("../middleware/auth");
const express_validator_1 = require("express-validator");
const router = express_1.default.Router();
// Get user's orders
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const orders = await Order_1.default.find({ user: req.user._id })
            .populate('items.product')
            .populate('shippingAddress')
            .sort({ createdAt: -1 });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Get order by ID
router.get('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const order = await Order_1.default.findById(req.params.id)
            .populate('items.product')
            .populate('shippingAddress');
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        // Check if user owns this order or is admin
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Create new order
router.post('/', auth_1.authenticate, [
    (0, express_validator_1.body)('items').isArray({ min: 1 }),
    (0, express_validator_1.body)('items.*.product').isMongoId(),
    (0, express_validator_1.body)('items.*.quantity').isInt({ min: 1 }),
    (0, express_validator_1.body)('items.*.selectedQuantity').trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('shippingAddress').isMongoId(),
    (0, express_validator_1.body)('totalAmount').isFloat({ min: 0 })
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // Verify all products exist and calculate total
        let calculatedTotal = 0;
        for (const item of req.body.items) {
            const product = await Product_1.default.findById(item.product);
            if (!product || !product.inStock) {
                return res.status(400).json({ error: `Product ${(product === null || product === void 0 ? void 0 : product.name) || 'unknown'} is not available` });
            }
            calculatedTotal += product.price * item.quantity;
        }
        // Verify total amount matches calculation
        if (Math.abs(calculatedTotal - req.body.totalAmount) > 0.01) {
            return res.status(400).json({ error: 'Total amount mismatch' });
        }
        const order = new Order_1.default({
            user: req.user._id,
            ...req.body
        });
        await order.save();
        const populatedOrder = await Order_1.default.findById(order._id)
            .populate('items.product')
            .populate('shippingAddress');
        res.status(201).json(populatedOrder);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Update order status (admin only)
router.patch('/:id/status', auth_1.authenticate, auth_1.requireAdmin, [
    (0, express_validator_1.body)('status').isIn(['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'])
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const order = await Order_1.default.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).populate('items.product').populate('shippingAddress');
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Get all orders (admin only)
router.get('/admin/all', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = {};
        if (status) {
            query.status = status;
        }
        const orders = await Order_1.default.find(query)
            .populate('user', 'name email')
            .populate('items.product')
            .populate('shippingAddress')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
        const total = await Order_1.default.countDocuments(query);
        res.json({
            orders,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / parseInt(limit)),
                totalOrders: total
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
