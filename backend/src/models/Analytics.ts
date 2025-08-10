import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalyticsEvent extends Document {
  eventName: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  properties: Record<string, any>;
  userAgent?: string;
  ip?: string;
  page?: string;
  referrer?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
}

export interface IUserSession extends Document {
  userId?: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  pageViews: number;
  events: number;
  userAgent: string;
  ip: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
  isActive: boolean;
}

const AnalyticsEventSchema: Schema = new Schema({
  eventName: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  properties: {
    type: Schema.Types.Mixed,
    required: true
  },
  userAgent: String,
  ip: String,
  page: {
    type: String,
    index: true
  },
  referrer: String,
  location: {
    country: String,
    region: String,
    city: String
  }
}, {
  timestamps: false // We're using our own timestamp field
});

const UserSessionSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  startTime: {
    type: Date,
    required: true,
    index: true
  },
  endTime: Date,
  duration: {
    type: Number, // in seconds
    min: 0
  },
  pageViews: {
    type: Number,
    default: 0,
    min: 0
  },
  events: {
    type: Number,
    default: 0,
    min: 0
  },
  userAgent: String,
  ip: String,
  location: {
    country: String,
    region: String,
    city: String
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Additional indexes for analytics queries
AnalyticsEventSchema.index({ eventName: 1, timestamp: -1 });
AnalyticsEventSchema.index({ userId: 1, timestamp: -1 });
AnalyticsEventSchema.index({ timestamp: -1 }); // For time-based queries
UserSessionSchema.index({ userId: 1, startTime: -1 });
UserSessionSchema.index({ startTime: -1, isActive: 1 });

export const AnalyticsEvent = mongoose.model<IAnalyticsEvent>('AnalyticsEvent', AnalyticsEventSchema);
export const UserSession = mongoose.model<IUserSession>('UserSession', UserSessionSchema);