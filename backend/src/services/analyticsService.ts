export interface AnalyticsEvent {
  eventName: string;
  userId?: string;
  sessionId?: string;
  timestamp: Date;
  properties: Record<string, any>;
  userAgent?: string;
  ip?: string;
}

export interface UserBehavior {
  userId: string;
  events: AnalyticsEvent[];
  totalSessions: number;
  totalPageViews: number;
  averageSessionDuration: number;
  lastActivity: Date;
}

export interface AnalyticsMetrics {
  totalUsers: number;
  activeUsers: number;
  pageViews: number;
  conversions: number;
  revenue: number;
  bounceRate: number;
}

export class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  
  constructor() {
    console.log('Analytics service initialized');
  }

  async trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>): Promise<void> {
    try {
      const analyticsEvent: AnalyticsEvent = {
        ...event,
        timestamp: new Date(),
      };

      this.events.push(analyticsEvent);
      console.log('Event tracked:', analyticsEvent.eventName);

      // In a real implementation, this would be sent to an analytics service
      // like Google Analytics, Mixpanel, or stored in a time-series database
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  async trackPageView(
    userId: string, 
    page: string, 
    referrer?: string
  ): Promise<void> {
    await this.trackEvent({
      eventName: 'page_view',
      userId,
      properties: {
        page,
        referrer,
      },
    });
  }

  async trackUserAction(
    userId: string, 
    action: string, 
    details?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent({
      eventName: 'user_action',
      userId,
      properties: {
        action,
        ...details,
      },
    });
  }

  async trackConversion(
    userId: string, 
    conversionType: string, 
    value?: number
  ): Promise<void> {
    await this.trackEvent({
      eventName: 'conversion',
      userId,
      properties: {
        conversionType,
        value,
      },
    });
  }

  async trackPurchase(
    userId: string, 
    orderId: string, 
    amount: number, 
    products: any[]
  ): Promise<void> {
    await this.trackEvent({
      eventName: 'purchase',
      userId,
      properties: {
        orderId,
        amount,
        products,
      },
    });
  }

  async getUserBehavior(userId: string): Promise<UserBehavior | null> {
    try {
      const userEvents = this.events.filter(event => event.userId === userId);
      
      if (userEvents.length === 0) {
        return null;
      }

      // Calculate metrics
      const sessions = new Set(userEvents.map(e => e.sessionId)).size;
      const pageViews = userEvents.filter(e => e.eventName === 'page_view').length;
      
      return {
        userId,
        events: userEvents,
        totalSessions: sessions,
        totalPageViews: pageViews,
        averageSessionDuration: 0, // Would be calculated from session data
        lastActivity: userEvents[userEvents.length - 1]?.timestamp || new Date(),
      };
    } catch (error) {
      console.error('Failed to get user behavior:', error);
      return null;
    }
  }

  async getMetrics(startDate: Date, endDate: Date): Promise<AnalyticsMetrics> {
    try {
      const filteredEvents = this.events.filter(
        event => event.timestamp >= startDate && event.timestamp <= endDate
      );

      const uniqueUsers = new Set(filteredEvents.map(e => e.userId)).size;
      const pageViews = filteredEvents.filter(e => e.eventName === 'page_view').length;
      const conversions = filteredEvents.filter(e => e.eventName === 'conversion').length;
      const purchases = filteredEvents.filter(e => e.eventName === 'purchase');
      const revenue = purchases.reduce((sum, event) => sum + (event.properties.amount || 0), 0);

      return {
        totalUsers: uniqueUsers,
        activeUsers: uniqueUsers, // Simplified for now
        pageViews,
        conversions,
        revenue,
        bounceRate: 0, // Would be calculated from session data
      };
    } catch (error) {
      console.error('Failed to get metrics:', error);
      throw new Error('Failed to retrieve analytics metrics');
    }
  }

  async createDashboardData(userId?: string): Promise<any> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      
      const metrics = await this.getMetrics(startDate, endDate);
      
      return {
        metrics,
        charts: {
          dailyUsers: [], // Would be populated with daily user counts
          pageViews: [], // Would be populated with daily page views
          conversions: [], // Would be populated with conversion funnel
        },
        topPages: [], // Most visited pages
        userFlow: [], // User journey analysis
      };
    } catch (error) {
      console.error('Failed to create dashboard data:', error);
      throw new Error('Failed to generate dashboard data');
    }
  }
}

export const analyticsService = new AnalyticsService();