const mongoose = require('mongoose');

// Category Schema definition
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        unique: true
    },
    image: {
        type: String,
        required: [true, 'Category image URL is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Category description is required'],
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
                // Tax is required if taxApplicability is true
                if (this.taxApplicability) {
                    return value > 0;
                }
                return true;
            },
            message: 'Tax must be provided and greater than 0 when tax applicability is true'
        }
    },
    taxType: {
        type: String,
        trim: true,
        enum: ['percentage', 'fixed'],
        default: 'percentage'
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Note: 'unique: true' on name implicitly creates a unique index; no additional index is necessary

module.exports = mongoose.model('Category', categorySchema);