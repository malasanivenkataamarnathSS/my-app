import express, { Response } from 'express';
import Address from '../models/Address';
import User from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get user's addresses
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const addresses = await Address.find({ user: req.user!._id }).sort({ isDefault: -1, createdAt: -1 });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get address by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const address = await Address.findOne({ 
      _id: req.params.id, 
      user: req.user!._id 
    });
    
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }
    
    res.json(address);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new address
router.post('/', authenticate, [
  body('name').trim().isLength({ min: 1 }),
  body('street').trim().isLength({ min: 5 }),
  body('city').trim().isLength({ min: 1 }),
  body('state').trim().isLength({ min: 1 }),
  body('postalCode').trim().isLength({ min: 3 }),
  body('country').trim().isLength({ min: 1 }),
  body('coordinates.lat').isFloat({ min: -90, max: 90 }),
  body('coordinates.lng').isFloat({ min: -180, max: 180 })
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // If this is the first address or marked as default, make it default
    const addressCount = await Address.countDocuments({ user: req.user!._id });
    const isDefault = req.body.isDefault || addressCount === 0;

    // If setting as default, unset other default addresses
    if (isDefault) {
      await Address.updateMany(
        { user: req.user!._id },
        { isDefault: false }
      );
    }

    const address = new Address({
      user: req.user!._id,
      ...req.body,
      isDefault
    });

    await address.save();

    // Update user's addresses array
    await User.findByIdAndUpdate(
      req.user!._id,
      { $push: { addresses: address._id } }
    );

    res.status(201).json(address);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update address
router.put('/:id', authenticate, [
  body('name').optional().trim().isLength({ min: 1 }),
  body('street').optional().trim().isLength({ min: 5 }),
  body('city').optional().trim().isLength({ min: 1 }),
  body('state').optional().trim().isLength({ min: 1 }),
  body('postalCode').optional().trim().isLength({ min: 3 }),
  body('country').optional().trim().isLength({ min: 1 }),
  body('coordinates.lat').optional().isFloat({ min: -90, max: 90 }),
  body('coordinates.lng').optional().isFloat({ min: -180, max: 180 })
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // If setting as default, unset other default addresses
    if (req.body.isDefault) {
      await Address.updateMany(
        { user: req.user!._id },
        { isDefault: false }
      );
    }

    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user!._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json(address);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete address
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const address = await Address.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user!._id 
    });

    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    // Remove from user's addresses array
    await User.findByIdAndUpdate(
      req.user!._id,
      { $pull: { addresses: address._id } }
    );

    // If deleted address was default, make another address default
    if (address.isDefault) {
      const firstAddress = await Address.findOne({ user: req.user!._id });
      if (firstAddress) {
        firstAddress.isDefault = true;
        await firstAddress.save();
      }
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Set default address
router.patch('/:id/default', authenticate, async (req: AuthRequest, res) => {
  try {
    // Unset all default addresses for user
    await Address.updateMany(
      { user: req.user!._id },
      { isDefault: false }
    );

    // Set the specified address as default
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user!._id },
      { isDefault: true },
      { new: true }
    );

    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json(address);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;