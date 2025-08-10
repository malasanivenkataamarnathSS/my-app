const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    image: {
        url: String,
        alt: String
    },
    icon: {
        type: String, // Icon class or SVG for UI
        default: 'category-icon'
    },
    slug: {
        type: String,
        unique: true
    },
    subcategories: [{
        name: { type: String, required: true },
        description: String,
        image: {
            url: String,
            alt: String
        }
    }],
    // Display settings
    displayOrder: {
        type: Number,
        default: 0
    },
    color: {
        type: String,
        default: '#10B981' // Tailwind green-500
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

// Indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1, displayOrder: 1 });

// Pre-save middleware to generate slug
categorySchema.pre('save', function(next) {
    if (this.isNew || this.isModified('name')) {
        this.slug = this.name.toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .trim();
    }
    next();
});

// Method to add subcategory
categorySchema.methods.addSubcategory = function(subcategoryData) {
    // Check if subcategory already exists
    const exists = this.subcategories.some(sub => sub.name.toLowerCase() === subcategoryData.name.toLowerCase());
    if (!exists) {
        this.subcategories.push(subcategoryData);
        return this.save();
    }
    return Promise.resolve(this);
};

// Method to remove subcategory
categorySchema.methods.removeSubcategory = function(subcategoryName) {
    this.subcategories = this.subcategories.filter(sub => 
        sub.name.toLowerCase() !== subcategoryName.toLowerCase()
    );
    return this.save();
};

// Static method to get active categories with product counts
categorySchema.statics.getWithProductCounts = async function() {
    const Product = require('./Product');
    
    const categories = await this.find({ isActive: true })
        .sort({ displayOrder: 1, name: 1 });
    
    const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
            const productCount = await Product.countDocuments({ 
                category: category._id, 
                isActive: true 
            });
            
            return {
                ...category.toObject(),
                productCount
            };
        })
    );
    
    return categoriesWithCounts;
};

// Static method to get featured categories
categorySchema.statics.getFeatured = function() {
    return this.find({ isActive: true, isFeatured: true })
        .sort({ displayOrder: 1, name: 1 });
};

// Virtual for full image URL
categorySchema.virtual('fullImageUrl').get(function() {
    if (!this.image || !this.image.url) return null;
    return this.image.url.startsWith('http') 
        ? this.image.url 
        : `${process.env.BASE_URL || 'http://localhost:5000'}${this.image.url}`;
});

// Ensure virtual fields are serialized
categorySchema.set('toJSON', {
    virtuals: true
});

module.exports = mongoose.model('Category', categorySchema);