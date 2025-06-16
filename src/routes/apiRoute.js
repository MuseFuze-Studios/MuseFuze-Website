const express = require('express');
const os = require('os');
const router = express.Router();

router.get('/status', (req, res) => {
    res.json({
        status: 'Server is running',
        uptime: `${Math.floor(process.uptime() / 60)} minutes`,
        serverTime: new Date().toISOString(),
        systemInfo: {
            platform: os.platform(),
            architecture: os.arch(),
            cpuCores: os.cpus().length,
            memoryUsage: {
                total: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
                free: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
                used: `${((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2)} GB`,
            },
            loadAverage: os.loadavg().map(avg => avg.toFixed(2)), // Last 1, 5, 15 mins
        },
        processInfo: {
            nodeVersion: process.version,
            processId: process.pid,
            memoryUsage: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
        },
    });
});

module.exports = router;
