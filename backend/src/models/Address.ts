import mongoose from 'mongoose';

export interface IAddress extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new mongoose.Schema<IAddress>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  street: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  postalCode: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  coordinates: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model<IAddress>('Address', addressSchema);