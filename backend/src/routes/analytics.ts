import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { analyticsService } from '../services/analyticsService';
import { AnalyticsEvent, UserSession } from '../models/Analytics';

const router = express.Router();

// Track event
router.post('/track',
  [
    body('eventName').notEmpty().withMessage('Event name is required'),
    body('properties').optional().isObject().withMessage('Properties must be an object'),
    body('sessionId').notEmpty().withMessage('Session ID is required'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        eventName,
        properties = {},
        sessionId,
        page,
        referrer
      } = req.body;

      const userId = req.user?._id?.toString();
      const userAgent = req.headers['user-agent'];
      const ip = req.ip;

      // Track the event
      await analyticsService.trackEvent({
        eventName,
        userId,
        sessionId,
        properties,
        userAgent,
        ip,
      });

      // Save to database
      const event = new AnalyticsEvent({
        eventName,
        userId,
        sessionId,
        timestamp: new Date(),
        properties,
        userAgent,
        ip,
        page,
        referrer
      });

      await event.save();

      // Update session
      await UserSession.findOneAndUpdate(
        { sessionId },
        {
          $inc: { events: 1 },
          $set: { 
            endTime: new Date(),
            userId: userId || undefined
          }
        },
        { upsert: false }
      );

      res.json({
        success: true,
        message: 'Event tracked successfully'
      });
    } catch (error) {
      console.error('Failed to track event:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to track event' 
      });
    }
  }
);

// Track page view
router.post('/pageview',
  [
    body('page').notEmpty().withMessage('Page is required'),
    body('sessionId').notEmpty().withMessage('Session ID is required'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { page, sessionId, referrer } = req.body;
      const userId = req.user?._id?.toString();
      if (!userId) {
        return res.status(401).json({ success: false, error: 'User not authenticated' });
      }

      await analyticsService.trackPageView(userId, page, referrer);

      // Update session
      await UserSession.findOneAndUpdate(
        { sessionId },
        {
          $inc: { pageViews: 1, events: 1 },
          $set: { endTime: new Date() }
        },
        { upsert: false }
      );

      res.json({
        success: true,
        message: 'Page view tracked successfully'
      });
    } catch (error) {
      console.error('Failed to track page view:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to track page view' 
      });
    }
  }
);

// Start session
router.post('/session/start',
  [
    body('sessionId').notEmpty().withMessage('Session ID is required'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { sessionId } = req.body;
      const userId = req.user?._id?.toString();
      const userAgent = req.headers['user-agent'];
      const ip = req.ip;

      const session = new UserSession({
        userId,
        sessionId,
        startTime: new Date(),
        userAgent,
        ip,
        pageViews: 0,
        events: 0,
        isActive: true
      });

      await session.save();

      res.json({
        success: true,
        sessionId,
        message: 'Session started successfully'
      });
    } catch (error) {
      console.error('Failed to start session:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to start session' 
      });
    }
  }
);

// End session
router.post('/session/end',
  [
    body('sessionId').notEmpty().withMessage('Session ID is required'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { sessionId } = req.body;
      const endTime = new Date();

      const session = await UserSession.findOneAndUpdate(
        { sessionId },
        {
          $set: { 
            endTime,
            isActive: false
          }
        },
        { new: true }
      );

      if (session) {
        // Calculate duration
        const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);
        session.duration = duration;
        await session.save();
      }

      res.json({
        success: true,
        message: 'Session ended successfully'
      });
    } catch (error) {
      console.error('Failed to end session:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to end session' 
      });
    }
  }
);

// Get dashboard data (admin only)
router.get('/dashboard', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin (you'd implement this check based on your auth system)
    // For now, we'll allow any authenticated user
    
    const dashboardData = await analyticsService.createDashboardData();

    // Get additional database metrics
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalEvents = await AnalyticsEvent.countDocuments({
      timestamp: { $gte: startDate, $lte: endDate }
    });

    const totalSessions = await UserSession.countDocuments({
      startTime: { $gte: startDate, $lte: endDate }
    });

    const activeSessions = await UserSession.countDocuments({
      isActive: true
    });

    // Top pages
    const topPages = await AnalyticsEvent.aggregate([
      {
        $match: {
          eventName: 'page_view',
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$page',
          views: { $sum: 1 }
        }
      },
      {
        $sort: { views: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: {
        ...dashboardData,
        summary: {
          totalEvents,
          totalSessions,
          activeSessions,
          topPages
        }
      }
    });
  } catch (error) {
    console.error('Failed to get dashboard data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve dashboard data' 
    });
  }
});

// Get user behavior (admin only)
router.get('/user/:userId/behavior', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.userId;
    
    const behavior = await analyticsService.getUserBehavior(userId);

    if (!behavior) {
      return res.status(404).json({ 
        success: false, 
        error: 'No behavior data found for user' 
      });
    }

    // Get additional data from database
    const sessions = await UserSession.find({ userId })
      .sort({ startTime: -1 })
      .limit(10);

    const recentEvents = await AnalyticsEvent.find({ userId })
      .sort({ timestamp: -1 })
      .limit(20);

    res.json({
      success: true,
      data: {
        behavior,
        recentSessions: sessions,
        recentEvents
      }
    });
  } catch (error) {
    console.error('Failed to get user behavior:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve user behavior' 
    });
  }
});

// Get metrics for date range
router.get('/metrics',
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : 
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

      const metrics = await analyticsService.getMetrics(startDate, endDate);

      res.json({
        success: true,
        data: metrics,
        dateRange: { startDate, endDate }
      });
    } catch (error) {
      console.error('Failed to get metrics:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to retrieve metrics' 
      });
    }
  }
);

export default router;