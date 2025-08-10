const mongoose = require('mongoose');

const quantityOptionSchema = new mongoose.Schema({
    size: {
        type: String,
        required: true // e.g., '½ liter', '1 liter', '250g', '500g'
    },
    price: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true // e.g., 'liter', 'kg', 'piece'
    }
});

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required']
    },
    subcategory: {
        type: String,
        trim: true // e.g., 'Chicken', 'Mutton', 'Eggs' under 'Meat'
    },
    quantityOptions: [quantityOptionSchema],
    basePrice: {
        type: Number,
        required: [true, 'Base price is required']
    },
    images: [{
        url: { type: String, required: true },
        alt: { type: String, default: '' }
    }],
    availability: {
        type: Boolean,
        default: true
    },
    stockQuantity: {
        type: Number,
        default: 0
    },
    minOrderQuantity: {
        type: Number,
        default: 1
    },
    maxOrderQuantity: {
        type: Number,
        default: 100
    },
    // Special fields for milk products
    milkDelivery: {
        morning: { type: Boolean, default: false },
        evening: { type: Boolean, default: false },
        both: { type: Boolean, default: false }
    },
    // Nutritional information
    nutrition: {
        calories: Number,
        protein: Number,
        fat: Number,
        carbohydrates: Number,
        fiber: Number
    },
    // Product tags for better search
    tags: [String],
    // Rating system
    rating: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 }
    },
    // Product origin and certification
    organic: {
        type: Boolean,
        default: true
    },
    certifications: [String], // e.g., 'Organic Certified', 'Farm Fresh'
    origin: {
        farm: String,
        location: String
    },
    // SEO fields
    slug: {
        type: String,
        unique: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for better performance
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ slug: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });

// Pre-save middleware to generate slug
productSchema.pre('save', function(next) {
    if (this.isNew || this.isModified('name')) {
        this.slug = this.name.toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .trim();
    }
    next();
});

// Method to get the cheapest price option
productSchema.methods.getCheapestPrice = function() {
    if (this.quantityOptions.length === 0) return this.basePrice;
    return Math.min(...this.quantityOptions.map(option => option.price));
};

// Method to get price for specific quantity
productSchema.methods.getPriceForQuantity = function(size) {
    const option = this.quantityOptions.find(opt => opt.size === size);
    return option ? option.price : this.basePrice;
};

// Method to check if product is available for milk delivery
productSchema.methods.isAvailableForDelivery = function(deliveryTime) {
    if (!this.milkDelivery || !deliveryTime) return true;
    
    switch(deliveryTime.toLowerCase()) {
        case 'morning':
            return this.milkDelivery.morning || this.milkDelivery.both;
        case 'evening':
            return this.milkDelivery.evening || this.milkDelivery.both;
        case 'both':
            return this.milkDelivery.both;
        default:
            return true;
    }
};

// Static method to find products by category
productSchema.statics.findByCategory = function(categoryId, options = {}) {
    const query = { category: categoryId, isActive: true };
    
    if (options.featured) {
        query.isFeatured = true;
    }
    
    return this.find(query)
        .populate('category', 'name')
        .sort(options.sort || { createdAt: -1 })
        .limit(options.limit || 0);
};

// Static method for search
productSchema.statics.search = function(searchTerm, options = {}) {
    const query = {
        $and: [
            { isActive: true },
            {
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { description: { $regex: searchTerm, $options: 'i' } },
                    { tags: { $in: [new RegExp(searchTerm, 'i')] } },
                    { subcategory: { $regex: searchTerm, $options: 'i' } }
                ]
            }
        ]
    };
    
    return this.find(query)
        .populate('category', 'name')
        .sort(options.sort || { rating: -1, createdAt: -1 })
        .limit(options.limit || 20);
};

// Virtual for full image URLs (if using relative paths)
productSchema.virtual('fullImageUrls').get(function() {
    return this.images.map(img => ({
        ...img.toObject(),
        url: img.url.startsWith('http') ? img.url : `${process.env.BASE_URL || 'http://localhost:5000'}${img.url}`
    }));
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', {
    virtuals: true
});

module.exports = mongoose.model('Product', productSchema);