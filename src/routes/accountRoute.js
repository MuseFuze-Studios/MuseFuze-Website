const express = require('express');
const path = require('path');
const router = express.Router();
const geoip = require('geoip-lite');

// Toggle for enabling/disabling account system
const allowAccountLogin = true;

// List of restricted regions (ISO country codes)
const restrictedRegions = ["CN", "RU", "KP", "IR", "SY"]; // Blocked: China, Russia, North Korea, Iran, Syria

// Middleware: Check if accounts are enabled
const checkAccountAvailability = (req, res, next) => {
    if (!allowAccountLogin) {
        return res.sendFile(path.resolve(__dirname, '../../public/account-not-available.html'));
    }
    next();
};

// Middleware: Check for Restricted Regions
const checkRegionRestriction = (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress; // Get user IP
    const geo = geoip.lookup(ip); // Get geolocation data

    if (geo && restrictedRegions.includes(geo.country)) {
        return res.redirect('/legal/sorry-policy'); // Redirect restricted users
    }

    next();
};

// Middleware: Protect dashboard (Require Auth)
const requireAuth = (req, res, next) => {
    console.log("🔍 Checking Session on Protected Route:", req.sessionID, req.session);

    if (!req.session || !req.session.user) {
        console.log("❌ Session Not Found! Redirecting to Login.");
        return res.redirect('/account/login');
    }

    console.log("✅ User Authenticated:", req.session.user);
    next();
};

// ✅ Serve Login Page
router.get('/login', checkAccountAvailability, checkRegionRestriction, (req, res) => {
    if (req.session.user) {
        return res.redirect('/account/dashboard'); // If already logged in, redirect to dashboard
    }
    res.sendFile(path.resolve(__dirname, '../../public/login.html')); // Serve login page
});

// ✅ Serve Signup Page
router.get('/signup', checkAccountAvailability, checkRegionRestriction, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../public/signup.html'));
});

// ✅ Handle Logout
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Logout failed' });
        }
        res.json({ success: true, message: 'Logged out successfully', redirect: '/' });
    });
});

// ✅ Serve Dashboard Page (Protected Route)
router.get('/dashboard', requireAuth, checkAccountAvailability, checkRegionRestriction, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../public/account-dashboard.html'));
});

// ✅ Default Route: Redirects to Login or Dashboard
router.get('/', checkAccountAvailability, checkRegionRestriction, (req, res) => {
    if (req.session.user) {
        return res.redirect('/account/dashboard');
    }
    res.redirect('/account/login');
});

module.exports = router;
