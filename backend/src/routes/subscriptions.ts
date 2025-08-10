import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { subscriptionService } from '../services/subscriptionService';
import { Subscription, SubscriptionPlan } from '../models/Subscription';

const router = express.Router();

// Get all subscription plans
router.get('/plans', async (req: AuthRequest, res: Response) => {
  try {
    const plans = await subscriptionService.getAllPlans();
    
    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Failed to get subscription plans:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve subscription plans' 
    });
  }
});

// Get specific plan
router.get('/plans/:planId', async (req: AuthRequest, res: Response) => {
  try {
    const planId = req.params.planId;
    const plan = await subscriptionService.getPlan(planId);
    
    if (!plan) {
      return res.status(404).json({ 
        success: false, 
        error: 'Subscription plan not found' 
      });
    }

    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Failed to get subscription plan:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve subscription plan' 
    });
  }
});

// Create subscription
router.post('/create',
  authenticate,
  [
    body('planId').notEmpty().withMessage('Plan ID is required'),
    body('paymentMethodId').optional().isString().withMessage('Payment method ID must be a string'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { planId, paymentMethodId } = req.body;
      const userId = req.user?._id?.toString();
      if (!userId) {
        return res.status(401).json({ success: false, error: 'User not authenticated' });
      }

      // Check if user already has an active subscription
      const existingSubscription = await Subscription.findOne({
        userId,
        status: { $in: ['active', 'trialing'] }
      });

      if (existingSubscription) {
        return res.status(400).json({ 
          success: false, 
          error: 'User already has an active subscription' 
        });
      }

      const subscription = await subscriptionService.createSubscription(
        userId,
        planId,
        paymentMethodId
      );

      // Save to database
      const dbSubscription = new Subscription({
        userId,
        planId: subscription.planId,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        trialEnd: subscription.trialEnd,
        paymentMethodId,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
      });

      await dbSubscription.save();

      res.json({
        success: true,
        subscription: {
          id: dbSubscription._id,
          planId: subscription.planId,
          status: subscription.status,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          trialEnd: subscription.trialEnd,
        }
      });
    } catch (error) {
      console.error('Failed to create subscription:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to create subscription' 
      });
    }
  }
);

// Get user's subscription
router.get('/current', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id?.toString();

    const subscription = await Subscription.findOne({
      userId,
      status: { $in: ['active', 'trialing', 'past_due'] }
    }).populate('planId');

    if (!subscription) {
      return res.json({
        success: true,
        data: null,
        message: 'No active subscription found'
      });
    }

    const plan = await subscriptionService.getPlan(subscription.planId);

    res.json({
      success: true,
      data: {
        subscription: {
          id: subscription._id,
          planId: subscription.planId,
          status: subscription.status,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          trialEnd: subscription.trialEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        },
        plan
      }
    });
  } catch (error) {
    console.error('Failed to get user subscription:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve subscription' 
    });
  }
});

// Update subscription
router.patch('/:subscriptionId',
  authenticate,
  [
    body('planId').optional().isString().withMessage('Plan ID must be a string'),
    body('paymentMethodId').optional().isString().withMessage('Payment method ID must be a string'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const subscriptionId = req.params.subscriptionId;
      const { planId, paymentMethodId } = req.body;
      const userId = req.user?._id?.toString();

      // Verify subscription belongs to user
      const existingSubscription = await Subscription.findOne({
        _id: subscriptionId,
        userId
      });

      if (!existingSubscription) {
        return res.status(404).json({ 
          success: false, 
          error: 'Subscription not found' 
        });
      }

      let updatedSubscription = existingSubscription;

      // Update plan if provided
      if (planId && planId !== existingSubscription.planId) {
        const serviceSubscription = await subscriptionService.updateSubscription(
          existingSubscription.stripeSubscriptionId || subscriptionId,
          planId
        );

        updatedSubscription = await Subscription.findByIdAndUpdate(
          subscriptionId,
          { planId },
          { new: true }
        ) as any;
      }

      // Update payment method if provided
      if (paymentMethodId) {
        updatedSubscription = await Subscription.findByIdAndUpdate(
          subscriptionId,
          { paymentMethodId },
          { new: true }
        ) as any;
      }

      res.json({
        success: true,
        subscription: updatedSubscription
      });
    } catch (error) {
      console.error('Failed to update subscription:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to update subscription' 
      });
    }
  }
);

// Cancel subscription
router.post('/:subscriptionId/cancel',
  authenticate,
  [
    body('cancelAtPeriodEnd').optional().isBoolean().withMessage('Cancel at period end must be a boolean'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const subscriptionId = req.params.subscriptionId;
      const { cancelAtPeriodEnd = true } = req.body;
      const userId = req.user?._id?.toString();

      // Verify subscription belongs to user
      const subscription = await Subscription.findOne({
        _id: subscriptionId,
        userId
      });

      if (!subscription) {
        return res.status(404).json({ 
          success: false, 
          error: 'Subscription not found' 
        });
      }

      const canceledSubscription = await subscriptionService.cancelSubscription(
        subscription.stripeSubscriptionId || subscriptionId,
        cancelAtPeriodEnd
      );

      // Update database
      const updateData: any = {
        cancelAtPeriodEnd,
        canceledAt: cancelAtPeriodEnd ? undefined : new Date(),
      };

      if (!cancelAtPeriodEnd) {
        updateData.status = 'canceled';
      }

      const updatedSubscription = await Subscription.findByIdAndUpdate(
        subscriptionId,
        updateData,
        { new: true }
      );

      res.json({
        success: true,
        subscription: updatedSubscription,
        message: cancelAtPeriodEnd ? 
          'Subscription will be canceled at the end of the current period' : 
          'Subscription canceled immediately'
      });
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to cancel subscription' 
      });
    }
  }
);

// Reactivate canceled subscription
router.post('/:subscriptionId/reactivate', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const subscriptionId = req.params.subscriptionId;
    const userId = req.user?._id?.toString();

    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      userId,
      cancelAtPeriodEnd: true
    });

    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        error: 'Subscription not found or cannot be reactivated' 
      });
    }

    // Reactivate subscription
    const updatedSubscription = await Subscription.findByIdAndUpdate(
      subscriptionId,
      {
        cancelAtPeriodEnd: false,
        canceledAt: undefined
      },
      { new: true }
    );

    res.json({
      success: true,
      subscription: updatedSubscription,
      message: 'Subscription reactivated successfully'
    });
  } catch (error) {
    console.error('Failed to reactivate subscription:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to reactivate subscription' 
    });
  }
});

// Subscription webhook handler
router.post('/webhook',
  express.raw({ type: 'application/json' }),
  async (req: AuthRequest, res: Response) => {
    try {
      const payload = req.body;
      const signature = req.headers['stripe-signature'] as string;

      await subscriptionService.handleSubscriptionWebhook({
        type: 'webhook_event', // This would be parsed from actual Stripe webhook
        data: { object: payload }
      });

      res.json({ received: true });
    } catch (error) {
      console.error('Subscription webhook processing failed:', error);
      res.status(400).json({ error: 'Webhook processing failed' });
    }
  }
);

// Get subscription history/invoices
router.get('/history', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id?.toString();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const subscriptions = await Subscription.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Subscription.countDocuments({ userId });

    // Get plan details for each subscription
    const subscriptionsWithPlans = await Promise.all(
      subscriptions.map(async (sub) => {
        const plan = await subscriptionService.getPlan(sub.planId);
        return { ...sub, plan };
      })
    );

    res.json({
      success: true,
      data: {
        subscriptions: subscriptionsWithPlans,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Failed to get subscription history:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve subscription history' 
    });
  }
});

export default router;