const express = require('express');
const router = express.Router();
const {
    createSubCategory,
    getAllSubCategories,
    getSubCategoriesByCategory,
    getSubCategoryByIdOrName,
    updateSubCategory
} = require('../controllers/subCategoryController');

// @route   POST /api/subcategories
// @desc    Create a new sub-category under a category
// @access  Public
router.post('/', createSubCategory);

// @route   GET /api/subcategories
// @desc    Get all sub-categories
// @access  Public
router.get('/', getAllSubCategories);

// @route   GET /api/subcategories/category/:categoryId
// @desc    Get all sub-categories under a specific category
// @access  Public
router.get('/category/:categoryId', getSubCategoriesByCategory);

// @route   GET /api/subcategories/:identifier
// @desc    Get sub-category by ID or name
// @access  Public
router.get('/:identifier', getSubCategoryByIdOrName);

// @route   PUT /api/subcategories/:id
// @desc    Update sub-category attributes
// @access  Public
router.put('/:id', updateSubCategory);

module.exports = router;