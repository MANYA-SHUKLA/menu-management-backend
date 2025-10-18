const express = require('express');
const router = express.Router();
const {
    createCategory,
    getAllCategories,
    getCategoryByIdOrName,
    updateCategory
} = require('../controllers/categoryController');

// @route   POST /api/categories
// @desc    Create a new category
// @access  Public
router.post('/', createCategory);

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', getAllCategories);

// @route   GET /api/categories/:identifier
// @desc    Get category by ID or name
// @access  Public
router.get('/:identifier', getCategoryByIdOrName);

// @route   PUT /api/categories/:id
// @desc    Update category attributes
// @access  Public
router.put('/:id', updateCategory);

module.exports = router;