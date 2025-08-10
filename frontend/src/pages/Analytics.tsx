import React from 'react';
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard';

export const Analytics: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <AnalyticsDashboard isAdmin={true} />
      </div>
    </div>
  );
};