const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
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
    selectedSize: {
        type: String,
        required: true // e.g., '1 liter', '500g'
    },
    price: {
        type: Number,
        required: true
    },
    // For milk products
    deliveryPreference: {
        type: String,
        enum: ['morning', 'evening', 'both'],
        default: null
    },
    // Special instructions for this item
    notes: String
});

const deliveryAddressSchema = new mongoose.Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'India' },
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    contactName: String,
    contactPhone: String
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    status: {
        type: String,
        enum: [
            'pending',
            'confirmed',
            'preparing',
            'ready_for_delivery',
            'out_for_delivery',
            'delivered',
            'cancelled',
            'refunded'
        ],
        default: 'pending'
    },
    deliveryAddress: deliveryAddressSchema,
    // Pricing
    subtotal: {
        type: Number,
        required: true
    },
    deliveryFee: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    // Payment information
    paymentMethod: {
        type: String,
        enum: ['cod', 'online', 'wallet'],
        default: 'cod'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    transactionId: String,
    
    // Delivery information
    deliveryDate: {
        type: Date,
        required: true
    },
    deliveryTimeSlot: {
        type: String,
        required: true // e.g., '9:00 AM - 11:00 AM'
    },
    deliveryInstructions: String,
    
    // Order tracking
    statusHistory: [{
        status: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        note: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    
    // Delivery tracking
    deliveryAgent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date,
    
    // Customer feedback
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    review: String,
    reviewDate: Date,
    
    // Admin notes
    adminNotes: String,
    
    // Recurring order (for milk subscriptions)
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurringPattern: {
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly']
        },
        endDate: Date,
        pausedUntil: Date
    }
}, {
    timestamps: true
});

// Indexes for better performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1, deliveryDate: 1 });
orderSchema.index({ deliveryAgent: 1, status: 1 });

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
    if (this.isNew) {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.orderNumber = `ORD${dateStr}${randomNum}`;
        
        // Add initial status to history
        this.statusHistory.push({
            status: this.status,
            timestamp: new Date(),
            note: 'Order placed'
        });
    }
    next();
});

// Method to update order status
orderSchema.methods.updateStatus = function(newStatus, note = '', updatedBy = null) {
    this.status = newStatus;
    this.statusHistory.push({
        status: newStatus,
        timestamp: new Date(),
        note,
        updatedBy
    });
    
    // Set delivery time for delivered status
    if (newStatus === 'delivered' && !this.actualDeliveryTime) {
        this.actualDeliveryTime = new Date();
    }
    
    return this.save();
};

// Method to calculate totals
orderSchema.methods.calculateTotals = function() {
    this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate tax (5% GST for food items in India)
    this.tax = Math.round(this.subtotal * 0.05 * 100) / 100;
    
    // Calculate delivery fee based on order value
    if (this.subtotal < 500) {
        this.deliveryFee = 50;
    } else if (this.subtotal < 1000) {
        this.deliveryFee = 30;
    } else {
        this.deliveryFee = 0; // Free delivery for orders above 1000
    }
    
    this.total = this.subtotal + this.tax + this.deliveryFee - this.discount;
    this.total = Math.round(this.total * 100) / 100; // Round to 2 decimal places
};

// Method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
    const cancellableStatuses = ['pending', 'confirmed'];
    return cancellableStatuses.includes(this.status);
};

// Method to get estimated delivery time
orderSchema.methods.getEstimatedDeliveryTime = function() {
    if (this.estimatedDeliveryTime) return this.estimatedDeliveryTime;
    
    // Default estimation: 2-4 hours from confirmation
    const hoursToAdd = this.status === 'confirmed' ? 4 : 2;
    return new Date(Date.now() + hoursToAdd * 60 * 60 * 1000);
};

// Static method to get orders by user
orderSchema.statics.getByUser = function(userId, options = {}) {
    const query = { user: userId };
    
    if (options.status) {
        query.status = options.status;
    }
    
    return this.find(query)
        .populate('user', 'name email phone')
        .populate('items.product', 'name images category')
        .populate('deliveryAgent', 'name phone')
        .sort({ createdAt: -1 })
        .limit(options.limit || 0);
};

// Static method to get daily orders for admin
orderSchema.statics.getDailyOrders = function(date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return this.find({
        deliveryDate: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    })
    .populate('user', 'name email phone')
    .populate('items.product', 'name category')
    .sort({ deliveryTimeSlot: 1, createdAt: 1 });
};

// Virtual for order age
orderSchema.virtual('orderAge').get(function() {
    const now = new Date();
    const diffMs = now - this.createdAt;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
        return `${diffHours}h ${diffMinutes}m`;
    } else {
        return `${diffMinutes}m`;
    }
});

// Ensure virtual fields are serialized
orderSchema.set('toJSON', {
    virtuals: true
});

module.exports = mongoose.model('Order', orderSchema);