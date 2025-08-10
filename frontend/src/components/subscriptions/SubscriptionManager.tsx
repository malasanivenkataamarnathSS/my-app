import React, { useState, useEffect } from 'react';
import { Check, Crown, Star, CreditCard, Calendar, AlertCircle } from 'lucide-react';

interface SubscriptionPlan {
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

interface UserSubscription {
  id: string;
  planId: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEnd?: string;
  cancelAtPeriodEnd: boolean;
  plan?: SubscriptionPlan;
}

interface SubscriptionManagerProps {
  userId?: string;
}

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ userId }) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
  }, [userId]);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscriptions/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription plans:', error);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const response = await fetch('/api/subscriptions/current', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentSubscription(data.data?.subscription || null);
      }
    } catch (error) {
      console.error('Failed to fetch current subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ planId })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentSubscription(data.subscription);
        setSelectedPlan(null);
      } else {
        throw new Error('Failed to create subscription');
      }
    } catch (error) {
      console.error('Subscription creation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/subscriptions/${currentSubscription.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ cancelAtPeriodEnd: true })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!currentSubscription) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/subscriptions/${currentSubscription.id}/reactivate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number, currency: string, interval: string) => {
    const formattedPrice = (price / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    });
    return `${formattedPrice}/${interval}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'trialing':
        return 'text-blue-600 bg-blue-100';
      case 'past_due':
        return 'text-orange-600 bg-orange-100';
      case 'canceled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const PlanCard: React.FC<{ plan: SubscriptionPlan; isSelected: boolean; isCurrent: boolean }> = ({
    plan,
    isSelected,
    isCurrent
  }) => (
    <div
      className={`relative bg-white rounded-lg border-2 p-6 ${
        isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-200'
      } ${isCurrent ? 'ring-2 ring-green-500' : ''}`}
    >
      {plan.id === 'pro' && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}

      {isCurrent && (
        <div className="absolute -top-3 right-4">
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
            <Check className="w-4 h-4 mr-1" />
            Current
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
          {plan.id === 'enterprise' ? (
            <Crown className="w-6 h-6 text-blue-600" />
          ) : plan.id === 'pro' ? (
            <Star className="w-6 h-6 text-blue-600" />
          ) : (
            <CreditCard className="w-6 h-6 text-blue-600" />
          )}
        </div>
        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
        <p className="text-gray-600 mt-2">{plan.description}</p>
        <div className="mt-4">
          <span className="text-3xl font-bold text-gray-900">
            {formatPrice(plan.price, plan.currency, plan.interval)}
          </span>
        </div>
        {plan.trialDays && (
          <p className="text-sm text-blue-600 mt-2">{plan.trialDays}-day free trial</p>
        )}
      </div>

      <ul className="space-y-3 mb-6">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      {!isCurrent && (
        <button
          onClick={() => handleSubscribe(plan.id)}
          disabled={isProcessing}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            plan.id === 'pro'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isProcessing ? 'Processing...' : 'Get Started'}
        </button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-top-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Current Subscription Status */}
      {currentSubscription && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Current Subscription</h2>
              <div className="flex items-center mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentSubscription.status)}`}>
                  {currentSubscription.status.charAt(0).toUpperCase() + currentSubscription.status.slice(1)}
                </span>
                <span className="text-gray-600 ml-4">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Renews on {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              {currentSubscription.cancelAtPeriodEnd ? (
                <button
                  onClick={handleReactivateSubscription}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Reactivate
                </button>
              ) : (
                <button
                  onClick={handleCancelSubscription}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>

          {currentSubscription.cancelAtPeriodEnd && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-orange-800">
                <p className="font-medium">Subscription Canceled</p>
                <p>Your subscription will end on {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}. 
                   You'll continue to have access until then.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Plans */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select the perfect plan for your needs. Upgrade or downgrade at any time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isSelected={selectedPlan === plan.id}
            isCurrent={currentSubscription?.planId === plan.id}
          />
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          {[
            {
              question: 'Can I change my plan later?',
              answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated automatically.'
            },
            {
              question: 'What happens during the free trial?',
              answer: 'You get full access to all features during your free trial. You can cancel anytime before the trial ends.'
            },
            {
              question: 'How does billing work?',
              answer: 'You\'ll be billed automatically each month or year, depending on your chosen plan. All payments are secure and encrypted.'
            },
            {
              question: 'Can I cancel my subscription?',
              answer: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access until the end of your current billing period.'
            }
          ].map((faq, index) => (
            <div key={index} className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};