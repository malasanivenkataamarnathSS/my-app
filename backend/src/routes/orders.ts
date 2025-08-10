import express, { Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get user's orders
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const orders = await Order.find({ user: req.user!._id })
      .populate('items.product')
      .populate('shippingAddress')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get order by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('shippingAddress');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user owns this order or is admin
    if ((order.user as any).toString() !== (req.user!._id as any).toString() && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new order
router.post('/', authenticate, [
  body('items').isArray({ min: 1 }),
  body('items.*.product').isMongoId(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('items.*.selectedQuantity').trim().isLength({ min: 1 }),
  body('shippingAddress').isMongoId(),
  body('totalAmount').isFloat({ min: 0 })
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify all products exist and calculate total
    let calculatedTotal = 0;
    for (const item of req.body.items) {
      const product = await Product.findById(item.product);
      if (!product || !product.inStock) {
        return res.status(400).json({ error: `Product ${product?.name || 'unknown'} is not available` });
      }
      calculatedTotal += product.price * item.quantity;
    }

    // Verify total amount matches calculation
    if (Math.abs(calculatedTotal - req.body.totalAmount) > 0.01) {
      return res.status(400).json({ error: 'Total amount mismatch' });
    }

    const order = new Order({
      user: req.user!._id,
      ...req.body
    });

    await order.save();
    
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product')
      .populate('shippingAddress');

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update order status (admin only)
router.patch('/:id/status', authenticate, requireAdmin, [
  body('status').isIn(['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'])
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('items.product').populate('shippingAddress');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all orders (admin only)
router.get('/admin/all', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query: any = {};

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product')
      .populate('shippingAddress')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip((parseInt(page as string) - 1) * parseInt(limit as string));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        current: parseInt(page as string),
        total: Math.ceil(total / parseInt(limit as string)),
        totalOrders: total
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;