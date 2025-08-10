import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: string;
  title: string;
  body: string;
  type: 'order_update' | 'payment_success' | 'payment_failed' | 'promotion' | 'system' | 'custom';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  channels: ('push' | 'email' | 'sms')[];
  data?: Record<string, any>;
  scheduledFor?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  deviceTokens?: string[];
  topic?: string;
  priority: 'low' | 'normal' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxLength: 100
  },
  body: {
    type: String,
    required: true,
    maxLength: 500
  },
  type: {
    type: String,
    enum: ['order_update', 'payment_success', 'payment_failed', 'promotion', 'system', 'custom'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed'],
    default: 'pending'
  },
  channels: [{
    type: String,
    enum: ['push', 'email', 'sms']
  }],
  data: {
    type: Schema.Types.Mixed
  },
  scheduledFor: Date,
  sentAt: Date,
  deliveredAt: Date,
  readAt: Date,
  deviceTokens: [String],
  topic: String,
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ status: 1, scheduledFor: 1 });
NotificationSchema.index({ type: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);