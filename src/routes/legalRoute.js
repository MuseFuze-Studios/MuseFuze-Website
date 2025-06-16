const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/legal-index.html'));
});

router.get('/terms-of-service', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/legal-terms-of-services.html'));
});

router.get('/privacy-policy', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/legal-privacy-policy.html'));
});

router.get('/community-guidelines', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/legal-community-guidelines.html'));
});

router.get('/data-cookie-policy', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/legal-data-cookie-policy.html'));
});

router.get('/sorry-policy', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/sorry-policy.html'));
});

router.get('/refund-policy', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/legal-refund-policy.html'));
});
module.exports = router;
