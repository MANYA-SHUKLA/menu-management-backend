const mongoose = require('mongoose');

// SubCategory Schema definition
const subCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Sub-category name is required'],
        trim: true
    },
    image: {
        type: String,
        required: [true, 'Sub-category image URL is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Sub-category description is required'],
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category reference is required for sub-category']
    },
    taxApplicability: {
        type: Boolean,
        default: function() {
            // Default to parent category's tax applicability
            return this.parentCategory ? this.parentCategory.taxApplicability : false;
        }
    },
    tax: {
        type: Number,
        default: function() {
            // Default to parent category's tax value
            return this.parentCategory ? this.parentCategory.tax : 0;
        }
    }
}, {
    timestamps: true
});

// Virtual for populating parent category
subCategorySchema.virtual('parentCategory', {
    ref: 'Category',
    localField: 'category',
    foreignField: '_id',
    justOne: true
});

// Create index for better query performance
subCategorySchema.index({ name: 1 });
subCategorySchema.index({ category: 1 });

module.exports = mongoose.model('SubCategory', subCategorySchema);