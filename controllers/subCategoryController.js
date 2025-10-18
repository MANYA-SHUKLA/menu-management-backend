const SubCategory = require('../models/SubCategory');
const Category = require('../models/Category');

// @desc    Create a new sub-category
// @route   POST /api/subcategories
// @access  Public
const createSubCategory = async (req, res) => {
    try {
        const { name, image, description, category, taxApplicability, tax } = req.body;

        // Check if parent category exists
        const parentCategory = await Category.findById(category);
        if (!parentCategory) {
            return res.status(404).json({
                success: false,
                message: 'Parent category not found'
            });
        }

        // Check if sub-category with same name exists in the same category
        const existingSubCategory = await SubCategory.findOne({ 
            name, 
            category 
        });
        if (existingSubCategory) {
            return res.status(400).json({
                success: false,
                message: 'Sub-category with this name already exists in this category'
            });
        }

        // Use category's tax values as defaults if not provided
        const finalTaxApplicability = taxApplicability !== undefined ? taxApplicability : parentCategory.taxApplicability;
        const finalTax = tax !== undefined ? tax : parentCategory.tax;

        const subCategory = new SubCategory({
            name,
            image,
            description,
            category,
            taxApplicability: finalTaxApplicability,
            tax: finalTax
        });

        const savedSubCategory = await subCategory.save();

        // Populate category details in response
        await savedSubCategory.populate('category', 'name description');

        res.status(201).json({
            success: true,
            message: 'Sub-category created successfully',
            data: savedSubCategory
        });
    } catch (error) {
        console.error('Error creating sub-category:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating sub-category',
            error: error.message
        });
    }
};

// @desc    Get all sub-categories
// @route   GET /api/subcategories
// @access  Public
const getAllSubCategories = async (req, res) => {
    try {
        const subCategories = await SubCategory.find()
            .populate('category', 'name description')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: subCategories.length,
            data: subCategories
        });
    } catch (error) {
        console.error('Error fetching sub-categories:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sub-categories',
            error: error.message
        });
    }
};

// @desc    Get all sub-categories under a specific category
// @route   GET /api/subcategories/category/:categoryId
// @access  Public
const getSubCategoriesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        // Check if category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        const subCategories = await SubCategory.find({ category: categoryId })
            .populate('category', 'name description')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: subCategories.length,
            data: subCategories
        });
    } catch (error) {
        console.error('Error fetching sub-categories by category:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sub-categories',
            error: error.message
        });
    }
};

// @desc    Get sub-category by ID or name
// @route   GET /api/subcategories/:identifier
// @access  Public
const getSubCategoryByIdOrName = async (req, res) => {
    try {
        const { identifier } = req.params;

        let subCategory;
        
        if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
            subCategory = await SubCategory.findById(identifier)
                .populate('category', 'name description taxApplicability tax');
        } else {
            subCategory = await SubCategory.findOne({ 
                name: { $regex: new RegExp(identifier, 'i') } 
            }).populate('category', 'name description taxApplicability tax');
        }

        if (!subCategory) {
            return res.status(404).json({
                success: false,
                message: 'Sub-category not found'
            });
        }

        res.status(200).json({
            success: true,
            data: subCategory
        });
    } catch (error) {
        console.error('Error fetching sub-category:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sub-category',
            error: error.message
        });
    }
};

// @desc    Update sub-category
// @route   PUT /api/subcategories/:id
// @access  Public
const updateSubCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const subCategory = await SubCategory.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('category', 'name description');

        if (!subCategory) {
            return res.status(404).json({
                success: false,
                message: 'Sub-category not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Sub-category updated successfully',
            data: subCategory
        });
    } catch (error) {
        console.error('Error updating sub-category:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating sub-category',
            error: error.message
        });
    }
};

module.exports = {
    createSubCategory,
    getAllSubCategories,
    getSubCategoriesByCategory,
    getSubCategoryByIdOrName,
    updateSubCategory
};