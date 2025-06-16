const express = require('express');
const path = require('path');
const router = express.Router();

const allowStoreBrowsing = false; // Toggle store availability

// Sample data for store products
const storeItems = {
    games: [
        {
            product_id: "mlw-001",
            id: "my-last-wish",
            name: "My Last Wish",
            description: "An emotional, story-driven adventure with action-packed gameplay.",
            price: 29.99,
            image: "/images/my-last-wish-cover.jpg",
            category: "games"
        }
    ],
    software: [
        {
            product_id: "fxide-002",
            id: "fluxide",
            name: "FluxIDE",
            description: "The development environment\nfor developers. Made by developers.",
            price: 0.00, // Free software
            image: "/images/fluxide-cover.jpg",
            category: "software"
        }
    ],
    clothing: []
};

// Middleware to check store availability
router.use((req, res, next) => {
    if (!allowStoreBrowsing) {
        return res.sendFile(path.resolve(__dirname, '../../public/store-not-available.html'));
    }
    next();
});

// Route for main store page
router.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../public/store.html'));
});

// Get all store items
router.get('/listitemdetails', (req, res) => {
    res.json(storeItems);
});

// Get items by category
router.get('/:category', (req, res) => {
    const category = req.params.category.toLowerCase();
    if (storeItems[category]) {
        res.json(storeItems[category]);
    } else {
        res.status(404).json({ error: "Category not found" });
    }
});

// Serve the product page
router.get('/:category/:id', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../public/store_product_page.html'));
});

// API Endpoint: Get product details by ID
router.get('/api/:category/:id', (req, res) => {
    const category = req.params.category.toLowerCase();
    const itemId = req.params.id;
    
    if (!storeItems[category]) {
        return res.status(404).json({ error: "Category not found" });
    }

    const item = storeItems[category].find(product => product.id === itemId);

    if (!item) {
        return res.status(404).json({ error: "Item not found" });
    }

    res.json(item);
});

module.exports = router;
