import mongoose from 'mongoose';

export interface IProduct extends mongoose.Document {
  name: string;
  category: 'milk' | 'meat' | 'organic-oils' | 'organic-powders';
  subcategory?: string;
  description: string;
  price: number;
  unit: string;
  availableQuantities: string[];
  inStock: boolean;
  image?: string;
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    fat?: number;
    carbohydrates?: number;
    fiber?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new mongoose.Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['milk', 'meat', 'organic-oils', 'organic-powders']
  },
  subcategory: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true
  },
  availableQuantities: [{
    type: String,
    required: true
  }],
  inStock: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    default: undefined
  },
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    fat: Number,
    carbohydrates: Number,
    fiber: Number
  }
}, {
  timestamps: true
});

export default mongoose.model<IProduct>('Product', productSchema);