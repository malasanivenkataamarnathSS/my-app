import React from 'react';
import { SubscriptionManager } from '../components/subscriptions/SubscriptionManager';

export const Subscriptions: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SubscriptionManager />
    </div>
  );
};