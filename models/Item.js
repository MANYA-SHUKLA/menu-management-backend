const mongoose = require('mongoose');

// Item Schema definition
const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Item name is required'],
        trim: true
    },
    image: {
        type: String,
        required: [true, 'Item image URL is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Item description is required'],
        trim: true
    },
    taxApplicability: {
        type: Boolean,
        required: [true, 'Tax applicability is required'],
        default: false
    },
    tax: {
        type: Number,
        default: 0,
        validate: {
            validator: function(value) {
                if (this.taxApplicability) {
                    return value > 0;
                }
                return true;
            },
            message: 'Tax must be provided and greater than 0 when tax applicability is true'
        }
    },
    baseAmount: {
        type: Number,
        required: [true, 'Base amount is required'],
        min: [0, 'Base amount cannot be negative']
    },
    discount: {
        type: Number,
        default: 0,
        min: [0, 'Discount cannot be negative'],
        validate: {
            validator: function(value) {
                return value <= this.baseAmount;
            },
            message: 'Discount cannot exceed base amount'
        }
    },
    totalAmount: {
        type: Number,
        default: function() {
            // Calculate total amount as base amount minus discount
            return this.baseAmount - this.discount;
        }
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category reference is required for item']
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory',
        // Sub-category is optional
        default: null
    }
}, {
    timestamps: true
});

// Pre-save middleware to calculate total amount before saving
itemSchema.pre('save', function(next) {
    this.totalAmount = this.baseAmount - this.discount;
    next();
});

// Create indexes for better query performance
itemSchema.index({ name: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ subCategory: 1 });

module.exports = mongoose.model('Item', itemSchema);