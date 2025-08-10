import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Users, Eye, DollarSign, BarChart3, Calendar, Download } from 'lucide-react';

interface AnalyticsMetrics {
  totalUsers: number;
  activeUsers: number;
  pageViews: number;
  conversions: number;
  revenue: number;
  bounceRate: number;
}

interface ChartData {
  date: string;
  value: number;
  label?: string;
}

interface AnalyticsDashboardProps {
  userId?: string;
  isAdmin?: boolean;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ userId, isAdmin = false }) => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('users');

  const generateSampleChartData = useCallback((): ChartData[] => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const data: ChartData[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 100) + 20,
        label: date.toLocaleDateString()
      });
    }
    
    return data;
  }, [dateRange]);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin ? '/api/analytics/dashboard' : `/api/analytics/user/${userId}/behavior`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (isAdmin) {
          setMetrics(data.data.metrics);
          // Generate sample chart data
          setChartData(generateSampleChartData());
        }
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, isAdmin, generateSampleChartData]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change?: string;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, change, icon, color }) => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const SimpleChart: React.FC<{ data: ChartData[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Trend Overview</h3>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="users">Users</option>
            <option value="pageviews">Page Views</option>
            <option value="revenue">Revenue</option>
          </select>
        </div>
        
        <div className="h-64 flex items-end space-x-2">
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                style={{ height: `${(item.value / maxValue) * 200}px` }}
                title={`${item.label}: ${item.value}`}
              />
              <span className="text-xs text-gray-500 mt-2 transform rotate-45 origin-left">
                {new Date(item.date).getDate()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-top-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Analytics Dashboard' : 'My Activity'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin ? 'Monitor your app performance and user engagement' : 'Track your usage and activity'}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      {isAdmin && metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Users"
            value={metrics.totalUsers.toLocaleString()}
            change="+12% from last period"
            icon={<Users className="w-6 h-6 text-white" />}
            color="bg-blue-500"
          />
          <MetricCard
            title="Page Views"
            value={metrics.pageViews.toLocaleString()}
            change="+8% from last period"
            icon={<Eye className="w-6 h-6 text-white" />}
            color="bg-green-500"
          />
          <MetricCard
            title="Revenue"
            value={`$${metrics.revenue.toLocaleString()}`}
            change="+15% from last period"
            icon={<DollarSign className="w-6 h-6 text-white" />}
            color="bg-purple-500"
          />
          <MetricCard
            title="Conversion Rate"
            value={`${(metrics.conversions / metrics.totalUsers * 100).toFixed(1)}%`}
            change="+3% from last period"
            icon={<TrendingUp className="w-6 h-6 text-white" />}
            color="bg-orange-500"
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleChart data={chartData} />
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { action: 'Page Visit', page: '/products', time: '2 minutes ago' },
              { action: 'Order Created', page: 'Order #1234', time: '1 hour ago' },
              { action: 'Profile Updated', page: '/profile', time: '3 hours ago' },
              { action: 'Payment Made', page: 'Order #1233', time: '1 day ago' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.page}</p>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-3">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Engagement Score</h4>
            <p className="text-2xl font-bold text-blue-600 mt-1">8.5/10</p>
            <p className="text-sm text-gray-600 mt-1">Based on user interactions</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-3">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Avg Session Duration</h4>
            <p className="text-2xl font-bold text-green-600 mt-1">4m 32s</p>
            <p className="text-sm text-gray-600 mt-1">Time spent per session</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-3">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Growth Rate</h4>
            <p className="text-2xl font-bold text-purple-600 mt-1">+24%</p>
            <p className="text-sm text-gray-600 mt-1">Month over month</p>
          </div>
        </div>
      </div>
    </div>
  );
};