const express = require('express');
const router = express.Router();
const {
    createItem,
    getAllItems,
    getItemsByCategory,
    getItemsBySubCategory,
    getItemByIdOrName,
    updateItem,
    searchItemsByName
} = require('../controllers/itemController');

// @route   POST /api/items
// @desc    Create a new item under a category or sub-category
// @access  Public
router.post('/', createItem);

// @route   GET /api/items
// @desc    Get all items
// @access  Public
router.get('/', getAllItems);

// @route   GET /api/items/category/:categoryId
// @desc    Get all items under a specific category
// @access  Public
router.get('/category/:categoryId', getItemsByCategory);

// @route   GET /api/items/subcategory/:subCategoryId
// @desc    Get all items under a specific sub-category
// @access  Public
router.get('/subcategory/:subCategoryId', getItemsBySubCategory);

// @route   GET /api/items/search/:query
// @desc    Search items by name
// @access  Public
router.get('/search/:query', searchItemsByName);

// @route   GET /api/items/:identifier
// @desc    Get item by ID or name
// @access  Public
router.get('/:identifier', getItemByIdOrName);

// @route   PUT /api/items/:id
// @desc    Update item attributes
// @access  Public
router.put('/:id', updateItem);

module.exports = router;