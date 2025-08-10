import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { notificationService } from '../services/notificationService';
import { Notification } from '../models/Notification';

const router = express.Router();

// Send notification to specific user
router.post('/send',
  authenticate,
  [
    body('userId').optional().isMongoId().withMessage('Invalid user ID'),
    body('title').notEmpty().withMessage('Title is required'),
    body('body').notEmpty().withMessage('Body is required'),
    body('type').isIn(['order_update', 'payment_success', 'payment_failed', 'promotion', 'system', 'custom'])
      .withMessage('Invalid notification type'),
    body('channels').isArray().withMessage('Channels must be an array'),
    body('scheduledFor').optional().isISO8601().withMessage('Invalid date format'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        userId = req.user?._id?.toString(),
        title,
        body,
        type,
        channels = ['push'],
        data = {},
        scheduledFor,
        priority = 'normal'
      } = req.body;

      // Create notification record
      const notification = new Notification({
        userId,
        title,
        body,
        type,
        channels,
        data,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
        priority,
        status: scheduledFor ? 'pending' : 'sent'
      });

      await notification.save();

      // Send immediately if not scheduled
      if (!scheduledFor) {
        if (channels.includes('push')) {
          // Get user's device tokens (would be stored in User model)
          const deviceToken = 'user_device_token'; // Placeholder
          
          const result = await notificationService.sendToDevice(deviceToken, {
            title,
            body,
            data
          });

          if (result.success) {
            notification.status = 'delivered';
            notification.sentAt = new Date();
            notification.deliveredAt = new Date();
            await notification.save();
          } else {
            notification.status = 'failed';
            await notification.save();
          }
        }
      }

      res.json({
        success: true,
        notification: {
          id: notification._id,
          status: notification.status,
          scheduledFor: notification.scheduledFor
        }
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to send notification' 
      });
    }
  }
);

// Send notification to topic/all users
router.post('/broadcast',
  authenticate,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('body').notEmpty().withMessage('Body is required'),
    body('topic').optional().isString().withMessage('Topic must be a string'),
    body('type').isIn(['order_update', 'payment_success', 'payment_failed', 'promotion', 'system', 'custom'])
      .withMessage('Invalid notification type'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        title,
        body,
        topic = 'all_users',
        type,
        data = {},
        priority = 'normal'
      } = req.body;

      // Send to topic
      const result = await notificationService.sendToTopic(topic, {
        title,
        body,
        data
      });

      // Create notification record for tracking
      const notification = new Notification({
        userId: req.user?._id?.toString(), // Admin user who sent it
        title,
        body,
        type,
        channels: ['push'],
        data,
        topic,
        priority,
        status: result.success ? 'sent' : 'failed',
        sentAt: result.success ? new Date() : undefined
      });

      await notification.save();

      res.json({
        success: true,
        messageId: result.messageId,
        notification: {
          id: notification._id,
          status: notification.status
        }
      });
    } catch (error) {
      console.error('Failed to broadcast notification:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to broadcast notification' 
      });
    }
  }
);

// Get user notifications
router.get('/user', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id?.toString();
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Notification.countDocuments({ userId });
    const unreadCount = await Notification.countDocuments({ 
      userId, 
      readAt: { $exists: false } 
    });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Failed to get notifications:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve notifications' 
    });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user?._id?.toString();

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        error: 'Notification not found' 
      });
    }

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update notification' 
    });
  }
});

// Subscribe to topic
router.post('/subscribe',
  authenticate,
  [
    body('deviceToken').notEmpty().withMessage('Device token is required'),
    body('topic').notEmpty().withMessage('Topic is required'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { deviceToken, topic } = req.body;

      const success = await notificationService.subscribeToTopic(deviceToken, topic);

      res.json({
        success,
        message: success ? 'Subscribed to topic' : 'Failed to subscribe'
      });
    } catch (error) {
      console.error('Failed to subscribe to topic:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to subscribe to topic' 
      });
    }
  }
);

// Unsubscribe from topic
router.post('/unsubscribe',
  authenticate,
  [
    body('deviceToken').notEmpty().withMessage('Device token is required'),
    body('topic').notEmpty().withMessage('Topic is required'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { deviceToken, topic } = req.body;

      const success = await notificationService.unsubscribeFromTopic(deviceToken, topic);

      res.json({
        success,
        message: success ? 'Unsubscribed from topic' : 'Failed to unsubscribe'
      });
    } catch (error) {
      console.error('Failed to unsubscribe from topic:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to unsubscribe from topic' 
      });
    }
  }
);

export default router;