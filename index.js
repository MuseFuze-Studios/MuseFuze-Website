require('dotenv').config();
const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const morgan = require('morgan');
const winston = require('winston');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bcrypt = require('bcrypt');
const mysql = require('mysql2');

const { promisify } = require("util");
const { error } = require('console');

const writeFileAsync = promisify(fs.writeFile);

const app = express();

const tempDir = path.join(__dirname, "temp");
if (fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, {recursive: true});
}

let db;

// ✅ **MySQL Database Connection**
if (process.env.NODE_ENV === "production") {
    db = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
} else {
    db = mysql.createPool({
        host: "localhost",
        user: "root",
        password: "admin",
        database: process.env.DB_NAME || "musefuze_db",
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
}


// ✅ **MySQL Session Store**
const sessionStore = new MySQLStore({
    expiration: 86400000,
    createDatabaseTable: true,
    clearExpired: true
}, db.promise());

console.log("Session Store is ready");

// Determine Environment (local or production)
const isProduction = process.env.NODE_ENV === 'production';

// Load SSL Certificates (Only in Production)
let sslOptions = {};
if (isProduction) {
    try {
        sslOptions = {
            key: fs.readFileSync('/etc/letsencrypt/live/musefuze.co.uk/privkey.pem'),
            cert: fs.readFileSync('/etc/letsencrypt/live/musefuze.co.uk/fullchain.pem'),
        };
        console.log('✅ SSL Certificates Loaded (Production Mode)');
    } catch (error) {
        console.error('❌ SSL Certificates Not Found! Running in HTTP mode.');
    }
}

app.set("trust proxy", true);

// ✅ **Session Middleware using MySQL**    
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: sessionStore,
        proxy: true,
        cookie: {
            secure: false,
            httpOnly: true,
            sameSite: isProduction ? "None" : "Lax",
            domain: isProduction ? ".musefuze.co.uk" : "localhost",
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        },
    })
);


// Logging: Winston Logger Configuration
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/server.log' }),
    ],
});

// Middleware: Morgan for HTTP Logging
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// ✅ **Security Enhancements**
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const allowedOrigins = [
    "http://localhost:3000",  // MuseFuze (local)
    "http://192.168.1.96:3000",  // MuseFuze (local)
    "http://localhost:3001",  // FluxVid (local)
    "https://musefuze.co.uk", // MuseFuze (prod)
    "https://fluxvid.musefuze.co.uk" // FluxVid (prod)
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 400,
    message: "Too many requests, please try again later.",
    keyGenerator: (req) => req.headers["x-forwarded-for"] || req.connection.remoteAddress, // ✅ Use correct client IP
}));

// ✅ **Authentication Routes**
app.post('/auth/register', async (req, res) => {
    let { username, email, password } = req.body;

    // Trim whitespace from input fields
    username = username.trim();
    email = email.trim();
    password = password.trim();

    if (!username || !email || !password) return res.status(400).json({ error: 'All fields are required' });

    // Validate Username
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) return res.status(400).json({ error: 'Invalid username format' });

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ error: 'Invalid email format' });

    // Password Strength Validation
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) return res.status(400).json({ error: 'Password must be at least 8 characters long, include a number, letter, and special character.' });

    try {
        // Check if username exists
        const [userExists] = await db.promise().query('SELECT id FROM users WHERE username = ?', [username]);
        if (userExists.length > 0) return res.status(400).json({ error: 'Username is already taken' });

        // Check if email exists
        const [emailExists] = await db.promise().query('SELECT id FROM users WHERE email = ?', [email]);
        if (emailExists.length > 0) return res.status(400).json({ error: 'Email is already registered' });

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert new user into the database
        await db.promise().query('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)', [username, email, hashedPassword]);

        res.status(201).json({ message: 'User registered successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ✅ **Login Route (Supports Username OR Email)**
app.post('/auth/login', async (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ error: 'All fields are required' });

    try {
        const [users] = await db.promise().query(
            'SELECT id, username, email, password_hash FROM users WHERE username = ? OR email = ?',
            [identifier, identifier]
        );
        if (users.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const user = users[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(401).json({ error: 'Invalid credentials' });

        // Store session
        req.session.user = { id: user.id, username: user.username, email: user.email };

        console.log("✅ Session Set:", req.session);
        console.log("Session ID:", req.sessionID);

        req.session.save(err => {
            if (err) {
                console.error("❌ Session Save Error:", err);
                return res.status(500).json({ error: 'Session could not be saved' });
            }
            console.log("✅ Session Successfully Saved:", req.session);
            res.json({ message: 'Login successful', user: req.session.user });
        });

    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// ✅ **Verify Session for FluxVid**
app.get('/api/authenticate', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    res.json({ user: req.session.user });
});

// API to fetch user details by user_id (used by FluxVid)
app.get("/api/get_user_username/:id", async (req, res) => {
    const userId = req.params.id;

    try {
        const [users] = await db.promise().query(
            "SELECT id, username, allow_community_engagement FROM users WHERE id = ?", 
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = users[0];

        // If the user has disabled community engagement, return "HIDDEN_USER"
        const username = user.allow_community_engagement ? user.username : "HIDDEN_USER";

        res.json({ id: user.id, username });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// ✅ **Logout Route**
app.post('/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: 'Could not log out' });
        res.json({ message: 'Logged out successfully' });
    });
});

// ✅ **Logout from All Devices**
app.post('/auth/logout-all', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });

    try {
        // Delete all sessions for the user
        await db.promise().query('DELETE FROM sessions WHERE data LIKE ?', [`%"id":${req.session.user.id}%`]);

        req.session.destroy((err) => {
            if (err) return res.status(500).json({ error: 'Could not log out from all devices' });
            res.json({ message: 'Logged out from all devices' });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ✅ **Fetch User Data**
app.get("/api/user", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "User not logged in" });
    }

    try {
        const [rows] = await db.promise().query(
            `SELECT id, username, email, created_at AS joined, last_login, collect_cookies,
                allow_analytics, personalized_ads, receive_emails, 
                store_purchase_history, save_game_progress, allow_community_engagement
            FROM users WHERE id = ?`,
            [req.session.user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/api/change-password", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Unauthorized: User not logged in" });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.session.user.id;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Both current and new passwords are required" });
    }

    // **Ensure new password meets security requirements**
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ error: "New password must be at least 8 characters long, including a number, letter, and special character." });
    }

    try {
        // **Retrieve user’s current hashed password**
        const [rows] = await db.promise().query("SELECT password_hash FROM users WHERE id = ?", [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const storedPasswordHash = rows[0].password_hash;

        // **Compare provided current password with stored hash**
        const isMatch = await bcrypt.compare(currentPassword, storedPasswordHash);
        if (!isMatch) {
            return res.status(401).json({ error: "Current password is incorrect" });
        }

        // **Check if new password is different from the old one**
        const isNewPasswordSame = await bcrypt.compare(newPassword, storedPasswordHash);
        if (isNewPasswordSame) {
            return res.status(400).json({ error: "New password must be different from the old password." });
        }

        // **Hash the new password securely**
        const newPasswordHash = await bcrypt.hash(newPassword, 12);

        // **Update the password in the database**
        await db.promise().query("UPDATE users SET password_hash = ? WHERE id = ?", [newPasswordHash, userId]);

        // **Force logout from all sessions (Optional Security Step)**
        await db.promise().query("DELETE FROM sessions WHERE data LIKE ?", [`%"id":${userId}%`]);

        return res.json({ success: "Password changed successfully. Please log in again." });

    } catch (error) {
        console.error("Error changing password:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});


app.post("/api/update-settings", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "User not logged in" });
    }

    const { settingKey, isChecked } = req.body;

    const allowedSettings = {
        "collect_cookies": "collect_cookies",
        "allow_analytics": "allow_analytics",
        "personalized_ads": "personalized_ads",
        "receive_emails": "receive_emails",
        "store_purchase_history": "store_purchase_history",
        "save_game_progress": "save_game_progress",
        "allow_community_engagement": "allow_community_engagement",
        "watch_history": "watch_history",
        "video_recommendations": "video_recommendations",
        "save_comments_likes": "save_comments_likes",
        "public_activity": "public_activity",
    };

    // ✅ Check if settingKey is valid
    if (!allowedSettings[settingKey]) {
        console.error("Invalid setting key received:", settingKey);
        return res.status(400).json({ error: "Invalid setting key" });
    }

    try {
        // ✅ Convert boolean to 0 or 1
        const isCheckedValue = isChecked ? 1 : 0;

        console.log(`Updating setting: ${settingKey} = ${isCheckedValue} for user ID ${req.session.user.id}`);

        // ✅ Use a safe query to prevent injection
        await db.promise().query(
            `UPDATE users SET ${allowedSettings[settingKey]} = ? WHERE id = ?`,
            [isCheckedValue, req.session.user.id]
        );

        res.json({ message: "Setting updated successfully" });
    } catch (error) {
        console.error("Error updating setting:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


//download user data
app.get("/api/download-data", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Unauthorized access" });
    }

    try {
        // **Fetch User Data**
        const [rows] = await db.promise().query(
            `SELECT id, username, email, created_at AS joined, last_login,
                collect_cookies, allow_analytics, personalized_ads, 
                receive_emails, store_purchase_history, save_game_progress, 
                allow_community_engagement, watch_history, video_recommendations,
                save_comments_likes, public_activity
            FROM users WHERE id = ?`,
            [req.session.user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const userData = rows[0];

        // **Ensure temp directory exists**
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // **Generate JSON File**
        const filePath = path.join(tempDir, `user_${req.session.user.id}_data.json`);
        await writeFileAsync(filePath, JSON.stringify(userData, null, 4));

        // **Send File for Download**
        res.download(filePath, "my_data.json", (err) => {
            if (err) {
                console.error("Error sending file:", err);
                res.status(500).json({ error: "Failed to generate file" });
            }

            // **Delete file after sending**
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.error("Error deleting temp file:", unlinkErr);
            });
        });

    } catch (error) {
        console.error("Error generating user data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ **Delete User Account**
app.delete("/api/delete-account", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    const userId = req.session.user.id;

    try {
        // ✅ Step 1: Delete User from the Database
        await db.promise().query("DELETE FROM users WHERE id = ?", [userId]);

        // ✅ Step 2: Destroy User Session
        req.session.destroy((err) => {
            if (err) return res.status(500).json({ error: "Failed to log out after account deletion." });
            res.json({ message: "Account successfully deleted." });
        });

    } catch (error) {
        console.error("Error deleting account:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Serve Static Files from /usr/website/public/ (or ./public locally)
app.use(express.static(path.join(__dirname, 'public')));

// Dynamic Routes
app.use('/', require('./src/routes/homeRoute'));
app.use('/account', require('./src/routes/accountRoute'));
app.use('/api', require('./src/routes/apiRoute'));
app.use('/store', require('./src/routes/storeRoute'));
app.use('/legal', require('./src/routes/legalRoute'));

// ✅ **Start Server**
const PORT = process.env.PORT || 3000;
const HOST = process.env.NODE_ENV === 'production' ? '127.0.0.1' : '0.0.0.0';

http.createServer(app).listen(PORT, HOST, () => {
    console.log(`🚀 Server running at http://${HOST}:${PORT}`);
});
