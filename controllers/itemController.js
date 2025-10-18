const Item = require('../models/Item');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');

// @desc    Create a new item
// @route   POST /api/items
// @access  Public
const createItem = async (req, res) => {
    try {
        const { 
            name, 
            image, 
            description, 
            taxApplicability, 
            tax, 
            baseAmount, 
            discount, 
            category, 
            subCategory 
        } = req.body;

        // Check if parent category exists
        const parentCategory = await Category.findById(category);
        if (!parentCategory) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // If subCategory is provided, check if it exists and belongs to the category
        if (subCategory) {
            const parentSubCategory = await SubCategory.findOne({
                _id: subCategory,
                category: category
            });
            if (!parentSubCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Sub-category not found or does not belong to the specified category'
                });
            }
        }

        // Check if item with same name exists in the same category/subcategory
        const existingItem = await Item.findOne({ 
            name, 
            category,
            subCategory: subCategory || null
        });
        if (existingItem) {
            return res.status(400).json({
                success: false,
                message: 'Item with this name already exists in this category/sub-category'
            });
        }

        // Calculate total amount
        const totalAmount = baseAmount - (discount || 0);

        const item = new Item({
            name,
            image,
            description,
            taxApplicability,
            tax: taxApplicability ? tax : 0,
            baseAmount,
            discount: discount || 0,
            totalAmount,
            category,
            subCategory: subCategory || null
        });

        const savedItem = await item.save();
        
        // Populate category and subcategory details in response
        await savedItem.populate('category', 'name description');
        if (savedItem.subCategory) {
            await savedItem.populate('subCategory', 'name description');
        }

        res.status(201).json({
            success: true,
            message: 'Item created successfully',
            data: savedItem
        });
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating item',
            error: error.message
        });
    }
};

// @desc    Get all items
// @route   GET /api/items
// @access  Public
const getAllItems = async (req, res) => {
    try {
        const items = await Item.find()
            .populate('category', 'name description')
            .populate('subCategory', 'name description')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching items',
            error: error.message
        });
    }
};

// @desc    Get all items under a specific category
// @route   GET /api/items/category/:categoryId
// @access  Public
const getItemsByCategory = async (req, res) => {
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

        const items = await Item.find({ category: categoryId })
            .populate('category', 'name description')
            .populate('subCategory', 'name description')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Error fetching items by category:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching items',
            error: error.message
        });
    }
};

// @desc    Get all items under a specific sub-category
// @route   GET /api/items/subcategory/:subCategoryId
// @access  Public
const getItemsBySubCategory = async (req, res) => {
    try {
        const { subCategoryId } = req.params;

        // Check if sub-category exists
        const subCategory = await SubCategory.findById(subCategoryId);
        if (!subCategory) {
            return res.status(404).json({
                success: false,
                message: 'Sub-category not found'
            });
        }

        const items = await Item.find({ subCategory: subCategoryId })
            .populate('category', 'name description')
            .populate('subCategory', 'name description')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error('Error fetching items by sub-category:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching items',
            error: error.message
        });
    }
};

// @desc    Get item by ID or name
// @route   GET /api/items/:identifier
// @access  Public
const getItemByIdOrName = async (req, res) => {
    try {
        const { identifier } = req.params;

        let item;
        
        if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
            item = await Item.findById(identifier)
                .populate('category', 'name description taxApplicability tax')
                .populate('subCategory', 'name description taxApplicability tax');
        } else {
            item = await Item.findOne({ 
                name: { $regex: new RegExp(identifier, 'i') } 
            })
            .populate('category', 'name description taxApplicability tax')
            .populate('subCategory', 'name description taxApplicability tax');
        }

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        res.status(200).json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error('Error fetching item:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching item',
            error: error.message
        });
    }
};

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Public
const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // If baseAmount or discount is updated, recalculate totalAmount
        if (updateData.baseAmount !== undefined || updateData.discount !== undefined) {
            const currentItem = await Item.findById(id);
            const newBaseAmount = updateData.baseAmount !== undefined ? updateData.baseAmount : currentItem.baseAmount;
            const newDiscount = updateData.discount !== undefined ? updateData.discount : currentItem.discount;
            updateData.totalAmount = newBaseAmount - newDiscount;
        }

        // If taxApplicability is set to false, reset tax to 0
        if (updateData.taxApplicability === false) {
            updateData.tax = 0;
        }

        const item = await Item.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
        .populate('category', 'name description')
        .populate('subCategory', 'name description');

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Item updated successfully',
            data: item
        });
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating item',
            error: error.message
        });
    }
};

// @desc    Search items by name
// @route   GET /api/items/search/:query
// @access  Public
const searchItemsByName = async (req, res) => {
    try {
        const { query } = req.params;

        if (!query || query.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const items = await Item.find({
            name: { $regex: new RegExp(query, 'i') } // Case-insensitive search
        })
        .populate('category', 'name description')
        .populate('subCategory', 'name description')
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: items.length,
            query: query,
            data: items
        });
    } catch (error) {
        console.error('Error searching items:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching items',
            error: error.message
        });
    }
};

module.exports = {
    createItem,
    getAllItems,
    getItemsByCategory,
    getItemsBySubCategory,
    getItemByIdOrName,
    updateItem,
    searchItemsByName
};