import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { paymentService } from '../services/paymentService';
import { Payment } from '../models/Payment';

const router = express.Router();

// Create payment intent
router.post('/create-payment-intent', 
  authenticate,
  [
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('currency').optional().isString().withMessage('Currency must be a string'),
    body('orderId').optional().isMongoId().withMessage('Invalid order ID'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { amount, currency = 'usd', orderId } = req.body;
      const userId = req.user?._id?.toString();

      const paymentIntent = await paymentService.createPaymentIntent(amount, currency);

      // Save payment record
      const payment = new Payment({
        userId,
        orderId,
        amount,
        currency,
        status: 'pending',
        paymentMethod: {
          type: 'card',
          details: {}
        },
        stripePaymentIntentId: paymentIntent.id,
      });

      await payment.save();

      res.json({
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          clientSecret: paymentIntent.clientSecret,
          amount,
          currency,
        }
      });
    } catch (error) {
      console.error('Payment intent creation failed:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to create payment intent' 
      });
    }
  }
);

// Confirm payment
router.post('/confirm-payment',
  authenticate,
  [
    body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required'),
    body('paymentMethodId').notEmpty().withMessage('Payment method ID is required'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { paymentIntentId, paymentMethodId } = req.body;
      const userId = req.user?._id?.toString();

      const confirmedPayment = await paymentService.confirmPayment(paymentIntentId, paymentMethodId);

      // Update payment record
      await Payment.findOneAndUpdate(
        { userId, stripePaymentIntentId: paymentIntentId },
        { 
          status: confirmedPayment.status === 'succeeded' ? 'succeeded' : 'failed',
          paidAt: confirmedPayment.status === 'succeeded' ? new Date() : undefined,
          failedAt: confirmedPayment.status !== 'succeeded' ? new Date() : undefined,
        }
      );

      res.json({
        success: true,
        payment: confirmedPayment
      });
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to confirm payment' 
      });
    }
  }
);

// Get payment history
router.get('/history', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id?.toString();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('orderId', 'orderNumber total')
      .lean();

    const total = await Payment.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Failed to get payment history:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve payment history' 
    });
  }
});

// Stripe webhook handler
router.post('/webhook', 
  express.raw({ type: 'application/json' }),
  async (req: AuthRequest, res: Response) => {
    try {
      const signature = req.headers['stripe-signature'] as string;
      const payload = req.body;

      const event = await paymentService.handleWebhook(payload, signature);

      // Process the webhook event
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentSuccess(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await handlePaymentFailure(event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook processing failed:', error);
      res.status(400).json({ error: 'Webhook processing failed' });
    }
  }
);

// Helper functions
async function handlePaymentSuccess(paymentIntent: any) {
  await Payment.findOneAndUpdate(
    { stripePaymentIntentId: paymentIntent.id },
    { 
      status: 'succeeded',
      paidAt: new Date(),
      metadata: paymentIntent
    }
  );
}

async function handlePaymentFailure(paymentIntent: any) {
  await Payment.findOneAndUpdate(
    { stripePaymentIntentId: paymentIntent.id },
    { 
      status: 'failed',
      failedAt: new Date(),
      failureReason: paymentIntent.last_payment_error?.message,
      metadata: paymentIntent
    }
  );
}

export default router;