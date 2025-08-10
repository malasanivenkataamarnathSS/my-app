export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  active: boolean;
  trialDays?: number;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEnd?: Date;
  canceledAt?: Date;
  stripeSubscriptionId?: string;
  paymentMethodId?: string;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  dueDate: Date;
  paidAt?: Date;
  stripeInvoiceId?: string;
}

export class SubscriptionService {
  constructor() {
    console.log('Subscription service initialized');
  }

  async createSubscription(
    userId: string, 
    planId: string, 
    paymentMethodId?: string
  ): Promise<Subscription> {
    try {
      const plan = await this.getPlan(planId);
      if (!plan) {
        throw new Error('Subscription plan not found');
      }

      const now = new Date();
      const periodEnd = new Date(now);
      
      if (plan.interval === 'month') {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      }

      const subscription: Subscription = {
        id: `sub_${Date.now()}`,
        userId,
        planId,
        status: plan.trialDays ? 'trialing' : 'active',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        trialEnd: plan.trialDays ? new Date(now.getTime() + plan.trialDays * 24 * 60 * 60 * 1000) : undefined,
        paymentMethodId,
      };

      console.log('Created subscription:', subscription.id);
      
      // In a real implementation, this would:
      // 1. Create subscription in Stripe
      // 2. Store in database
      // 3. Send confirmation email
      
      return subscription;
    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw new Error('Subscription creation failed');
    }
  }

  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<Subscription> {
    try {
      // Placeholder implementation
      const subscription: Subscription = {
        id: subscriptionId,
        userId: '',
        planId: '',
        status: cancelAtPeriodEnd ? 'active' : 'canceled',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        canceledAt: cancelAtPeriodEnd ? undefined : new Date(),
      };

      console.log('Canceled subscription:', subscriptionId);
      
      // In a real implementation, this would:
      // 1. Cancel subscription in Stripe
      // 2. Update database
      // 3. Send cancellation email
      
      return subscription;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw new Error('Subscription cancellation failed');
    }
  }

  async updateSubscription(subscriptionId: string, newPlanId: string): Promise<Subscription> {
    try {
      // Placeholder implementation
      const subscription: Subscription = {
        id: subscriptionId,
        userId: '',
        planId: newPlanId,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
      };

      console.log('Updated subscription:', subscriptionId, 'to plan:', newPlanId);
      
      return subscription;
    } catch (error) {
      console.error('Failed to update subscription:', error);
      throw new Error('Subscription update failed');
    }
  }

  async getPlan(planId: string): Promise<SubscriptionPlan | null> {
    // Default plans - in a real app, these would be stored in database
    const plans: SubscriptionPlan[] = [
      {
        id: 'basic',
        name: 'Basic Plan',
        description: 'Essential features for small businesses',
        price: 999, // $9.99 in cents
        currency: 'usd',
        interval: 'month',
        features: ['Up to 100 orders/month', 'Basic analytics', 'Email support'],
        active: true,
        trialDays: 14,
      },
      {
        id: 'pro',
        name: 'Pro Plan',
        description: 'Advanced features for growing businesses',
        price: 2999, // $29.99 in cents
        currency: 'usd',
        interval: 'month',
        features: ['Unlimited orders', 'Advanced analytics', 'Priority support', 'Custom branding'],
        active: true,
        trialDays: 14,
      },
      {
        id: 'enterprise',
        name: 'Enterprise Plan',
        description: 'Complete solution for large organizations',
        price: 9999, // $99.99 in cents
        currency: 'usd',
        interval: 'month',
        features: ['Everything in Pro', 'API access', 'Custom integrations', '24/7 support'],
        active: true,
      },
    ];

    return plans.find(plan => plan.id === planId) || null;
  }

  async getAllPlans(): Promise<SubscriptionPlan[]> {
    // Get all active plans
    const allPlans = [
      await this.getPlan('basic'),
      await this.getPlan('pro'),
      await this.getPlan('enterprise'),
    ];

    return allPlans.filter(plan => plan !== null) as SubscriptionPlan[];
  }

  async getUserSubscription(userId: string): Promise<Subscription | null> {
    try {
      // Placeholder implementation - would query database
      console.log('Getting subscription for user:', userId);
      return null; // No subscription found
    } catch (error) {
      console.error('Failed to get user subscription:', error);
      return null;
    }
  }

  async handleSubscriptionWebhook(event: any): Promise<void> {
    try {
      console.log('Processing subscription webhook:', event.type);
      
      // Handle different webhook events
      switch (event.type) {
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        default:
          console.log('Unhandled webhook event:', event.type);
      }
    } catch (error) {
      console.error('Webhook processing failed:', error);
      throw new Error('Webhook processing failed');
    }
  }

  private async handlePaymentSucceeded(invoice: any): Promise<void> {
    console.log('Payment succeeded for invoice:', invoice.id);
    // Update subscription status, send receipt email, etc.
  }

  private async handlePaymentFailed(invoice: any): Promise<void> {
    console.log('Payment failed for invoice:', invoice.id);
    // Notify user, retry payment, etc.
  }

  private async handleSubscriptionUpdated(subscription: any): Promise<void> {
    console.log('Subscription updated:', subscription.id);
    // Update local database with new subscription details
  }

  private async handleSubscriptionDeleted(subscription: any): Promise<void> {
    console.log('Subscription deleted:', subscription.id);
    // Update local database, send cancellation email, etc.
  }
}

export const subscriptionService = new SubscriptionService();