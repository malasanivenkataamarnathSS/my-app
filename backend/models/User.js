const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'India' },
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    isDefault: { type: Boolean, default: false }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        lowercase: true
    },
    dateOfBirth: {
        type: Date
    },
    addresses: [addressSchema],
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    isAdmin: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    otp: {
        code: { type: String },
        expiresAt: { type: Date },
        attempts: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

// Index for better performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });

// Virtual for user's age
userSchema.virtual('age').get(function() {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
});

// Method to add or update address
userSchema.methods.addAddress = function(addressData) {
    // If this is set as default, unset other default addresses
    if (addressData.isDefault) {
        this.addresses.forEach(addr => addr.isDefault = false);
    }
    
    // If no addresses exist, make this the default
    if (this.addresses.length === 0) {
        addressData.isDefault = true;
    }
    
    this.addresses.push(addressData);
    return this.save();
};

// Method to get default address
userSchema.methods.getDefaultAddress = function() {
    return this.addresses.find(addr => addr.isDefault) || this.addresses[0];
};

// Method to add to favorites
userSchema.methods.addToFavorites = function(productId) {
    if (!this.favorites.includes(productId)) {
        this.favorites.push(productId);
        return this.save();
    }
    return Promise.resolve(this);
};

// Method to remove from favorites
userSchema.methods.removeFromFavorites = function(productId) {
    this.favorites = this.favorites.filter(id => !id.equals(productId));
    return this.save();
};

// Method to generate OTP
userSchema.methods.generateOTP = function() {
    const otpLength = parseInt(process.env.OTP_LENGTH) || 6;
    const otp = Math.floor(Math.random() * Math.pow(10, otpLength)).toString().padStart(otpLength, '0');
    const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRE_MINUTES) || 10) * 60 * 1000);
    
    this.otp = {
        code: otp,
        expiresAt: expiresAt,
        attempts: 0
    };
    
    return this.save().then(() => otp);
};

// Method to verify OTP
userSchema.methods.verifyOTP = function(inputOtp) {
    if (!this.otp.code || !this.otp.expiresAt) {
        return false;
    }
    
    if (new Date() > this.otp.expiresAt) {
        this.otp = {};
        this.save();
        return false;
    }
    
    if (this.otp.attempts >= 5) {
        this.otp = {};
        this.save();
        return false;
    }
    
    this.otp.attempts += 1;
    
    if (this.otp.code === inputOtp) {
        this.otp = {};
        this.lastLogin = new Date();
        this.save();
        return true;
    }
    
    this.save();
    return false;
};

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
        delete ret.otp;
        return ret;
    }
});

module.exports = mongoose.model('User', userSchema);