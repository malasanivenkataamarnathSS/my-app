import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  email: string;
  name: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: Date;
  isVerified: boolean;
  otpCode?: string;
  otpExpires?: Date;
  role: 'user' | 'admin';
  addresses: mongoose.Types.ObjectId[];
  favoriteItems: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: undefined
  },
  dateOfBirth: {
    type: Date,
    default: undefined
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otpCode: {
    type: String,
    default: undefined
  },
  otpExpires: {
    type: Date,
    default: undefined
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  addresses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'
  }],
  favoriteItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!candidatePassword) return false;
  return await bcrypt.compare(candidatePassword, this.otpCode || '');
};

userSchema.pre('save', async function(next) {
  if (!this.isModified('otpCode') || !this.otpCode) return next();
  
  this.otpCode = await bcrypt.hash(this.otpCode, 12);
  next();
});

export default mongoose.model<IUser>('User', userSchema);