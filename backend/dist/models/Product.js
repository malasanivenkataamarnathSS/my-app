"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const productSchema = new mongoose_1.default.Schema({
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
exports.default = mongoose_1.default.model('Product', productSchema);
