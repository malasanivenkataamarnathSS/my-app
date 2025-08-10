"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Product_1 = __importDefault(require("../models/Product"));
const auth_1 = require("../middleware/auth");
const express_validator_1 = require("express-validator");
const router = express_1.default.Router();
// Get all products
router.get('/', async (req, res) => {
    try {
        const { category, search, inStock } = req.query;
        const query = {};
        if (category) {
            query.category = category;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (inStock !== undefined) {
            query.inStock = inStock === 'true';
        }
        const products = await Product_1.default.find(query).sort({ createdAt: -1 });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Get product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Create product (admin only)
router.post('/', auth_1.authenticate, auth_1.requireAdmin, [
    (0, express_validator_1.body)('name').trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('category').isIn(['milk', 'meat', 'organic-oils', 'organic-powders']),
    (0, express_validator_1.body)('description').trim().isLength({ min: 10 }),
    (0, express_validator_1.body)('price').isFloat({ min: 0 }),
    (0, express_validator_1.body)('unit').trim().isLength({ min: 1 }),
    (0, express_validator_1.body)('availableQuantities').isArray({ min: 1 })
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const product = new Product_1.default(req.body);
        await product.save();
        res.status(201).json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Update product (admin only)
router.put('/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const product = await Product_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Delete product (admin only)
router.delete('/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const product = await Product_1.default.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
