import express, { Response } from 'express';
import User from '../models/User';
import Product from '../models/Product';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Update user profile
router.put('/profile', authenticate, [
  body('name').optional().trim().isLength({ min: 2 }),
  body('gender').optional().isIn(['male', 'female', 'other']),
  body('dateOfBirth').optional().isISO8601()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      req.body,
      { new: true, runValidators: true }
    ).select('-otpCode -otpExpires');

    res.json({
      id: user!._id,
      email: user!.email,
      name: user!.name,
      role: user!.role,
      gender: user!.gender,
      dateOfBirth: user!.dateOfBirth
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's favorite items
router.get('/favorites', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user!._id).populate('favoriteItems');
    res.json(user!.favoriteItems);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add item to favorites
router.post('/favorites/:productId', authenticate, async (req: AuthRequest, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const user = await User.findById(req.user!._id);
    if (user!.favoriteItems.includes(req.params.productId as any)) {
      return res.status(400).json({ error: 'Product already in favorites' });
    }

    user!.favoriteItems.push(req.params.productId as any);
    await user!.save();

    res.json({ message: 'Product added to favorites' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove item from favorites
router.delete('/favorites/:productId', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { $pull: { favoriteItems: req.params.productId } },
      { new: true }
    );

    res.json({ message: 'Product removed from favorites' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Get all users
router.get('/admin/all', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-otpCode -otpExpires')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip((parseInt(page as string) - 1) * parseInt(limit as string));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: parseInt(page as string),
        total: Math.ceil(total / parseInt(limit as string)),
        totalUsers: total
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Update user role
router.patch('/admin/:id/role', authenticate, requireAdmin, [
  body('role').isIn(['user', 'admin'])
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    ).select('-otpCode -otpExpires');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;