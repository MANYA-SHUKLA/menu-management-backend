const Category = require('../models/Category');

// @desc    Create a new category
// @route   POST /api/categories
// @access  Public
const createCategory = async (req, res) => {
    try {
        const { name, image, description, taxApplicability, tax, taxType } = req.body;

        // Check if category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category with this name already exists'
            });
        }

        // Create new category
        const category = new Category({
            name,
            image,
            description,
            taxApplicability,
            tax: taxApplicability ? tax : 0,
            taxType: taxApplicability ? taxType : 'percentage'
        });

        const savedCategory = await category.save();

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: savedCategory
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating category',
            error: error.message
        });
    }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
};

// @desc    Get category by ID or name
// @route   GET /api/categories/:identifier
// @access  Public
const getCategoryByIdOrName = async (req, res) => {
    try {
        const { identifier } = req.params;

        let category;
        
        // Check if identifier is a valid MongoDB ObjectId (24 hex characters)
        if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
            category = await Category.findById(identifier);
        } else {
            // Search by name
            category = await Category.findOne({ 
                name: { $regex: new RegExp(identifier, 'i') } 
            });
        }

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching category',
            error: error.message
        });
    }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Public
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // If taxApplicability is set to false, reset tax to 0
        if (updateData.taxApplicability === false) {
            updateData.tax = 0;
        }

        const category = await Category.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: category
        });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating category',
            error: error.message
        });
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryByIdOrName,
    updateCategory
};