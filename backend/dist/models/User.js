"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.default.Schema({
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
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Address'
        }],
    favoriteItems: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Product'
        }]
}, {
    timestamps: true
});
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!candidatePassword)
        return false;
    return await bcryptjs_1.default.compare(candidatePassword, this.otpCode || '');
};
userSchema.pre('save', async function (next) {
    if (!this.isModified('otpCode') || !this.otpCode)
        return next();
    this.otpCode = await bcryptjs_1.default.hash(this.otpCode, 12);
    next();
});
exports.default = mongoose_1.default.model('User', userSchema);
