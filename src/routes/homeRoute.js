// File: src/routes/homeRoute.js
// Dir: C:\Users\Kaie_\Desktop\musefuze website v2

const express = require('express');
const path = require('path');
const router = express.Router();

// Launch-Pad Route
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Placeholder Routes
router.get('/about', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../public/about.html'));
});
router.get('/projects', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../public/projects.html'));
});
router.get('/projects/fluxide', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../public/projects_fluxide.html'));
});
router.get('/projects/my-last-wish', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../public/projects_my_last_wish.html'));
});
router.get('/blog', (req, res) => res.send('<h1>Blog</h1><p>Details coming soon...</p>'));
router.get('/careers', (req, res) => res.send('<h1>Careers</h1><p>Details coming soon...</p>'));
router.get('/contact', (req, res) => res.send('<h1>Contact Us</h1><p>Details coming soon...</p>'));

module.exports = router;
