import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  userId: string;
  orderId?: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  paymentMethod: {
    type: 'card' | 'bank_transfer' | 'digital_wallet';
    details: Record<string, any>;
  };
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  failedAt?: Date;
  failureReason?: string;
}

const PaymentSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  subscriptionId: {
    type: Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'usd'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'succeeded', 'failed', 'canceled'],
    default: 'pending',
    required: true
  },
  paymentMethod: {
    type: {
      type: String,
      enum: ['card', 'bank_transfer', 'digital_wallet'],
      required: true
    },
    details: {
      type: Schema.Types.Mixed,
      required: true
    }
  },
  stripePaymentIntentId: {
    type: String,
    unique: true,
    sparse: true
  },
  stripeChargeId: {
    type: String,
    unique: true,
    sparse: true
  },
  metadata: {
    type: Schema.Types.Mixed
  },
  paidAt: Date,
  failedAt: Date,
  failureReason: String
}, {
  timestamps: true
});

// Indexes for efficient queries
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ status: 1, createdAt: -1 });
PaymentSchema.index({ stripePaymentIntentId: 1 });

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);