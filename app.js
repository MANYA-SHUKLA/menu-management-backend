const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const categoryRoutes = require('./routes/categoryRoutes');
const subCategoryRoutes = require('./routes/subCategoryRoutes');
const itemRoutes = require('./routes/itemRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Basic route for health check
app.get('/', (req, res) => {
    res.json({ message: 'Menu Management API is running!' });
});

// Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/items', itemRoutes);

// 404 handler - FIXED: Use proper express 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        message: 'Route not found' 
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({ 
        success: false,
        message: 'Internal server error' 
    });
});

module.exports = app;