"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const cartItemSchema = new mongoose_1.default.Schema({
    product: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
const orderSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
        type: mongoose_1.default.Schema.Types.ObjectId,
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
exports.default = mongoose_1.default.model('Order', orderSchema);
