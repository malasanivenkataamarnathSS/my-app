import mongoose from 'mongoose';

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  selectedQuantity: string;
  milkSchedule?: 'morning' | 'evening' | 'both';
}

export interface IOrder extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';
  shippingAddress: mongoose.Types.ObjectId;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod?: string;
  deliveryDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new mongoose.Schema<ICartItem>({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  selectedQuantity: {
    type: String,
    required: true
  },
  milkSchedule: {
    type: String,
    enum: ['morning', 'evening', 'both'],
    default: undefined
  }
});

const orderSchema = new mongoose.Schema<IOrder>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    default: undefined
  },
  deliveryDate: {
    type: Date,
    default: undefined
  },
  notes: {
    type: String,
    default: undefined
  }
}, {
  timestamps: true
});

export default mongoose.model<IOrder>('Order', orderSchema);