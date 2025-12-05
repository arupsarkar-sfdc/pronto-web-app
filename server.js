import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import 'dotenv/config'; // Load .env file

const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN_ENDPOINT = process.env.TOKEN_ENDPOINT_URL || 'https://acme-dcunited-connector-app-58a61db33e61.herokuapp.com';
const SALESFORCE_PROXY_URL = process.env.SALESFORCE_PROXY_URL || 'https://mnrw0zbyh0yt0mldmmytqzrxg0.c360a.salesforce.com';

// Global Request Logger
app.use((req, res, next) => {
    console.log(`[Server] ${req.method} ${req.url}`);
    next();
});

// Middleware to parse JSON bodies
app.use(express.json());



// In-memory OTP Store: Map<userId, { code: string, expires: number }>
const otpStore = new Map();

// Helper to send Slack notification
async function sendSlackNotification(message) {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
        console.warn('[Slack] No webhook URL configured. OTP:', message);
        return;
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: message })
        });
        if (!response.ok) {
            console.error('[Slack] Failed to send notification:', response.statusText);
        }
    } catch (error) {
        console.error('[Slack] Error sending notification:', error);
    }
}

// Endpoint: Send OTP
app.post('/api/send-otp', async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP
    otpStore.set(userId, { code: otp, expires });

    // Send to Slack
    const message = `🔐 Admin Access Request\nUser: *${userId}*\nOTP: *${otp}*\nExpires in 5 minutes.`;
    await sendSlackNotification(message);

    console.log(`[OTP] Generated for ${userId}: ${otp}`); // Log for debugging if Slack fails
    res.json({ success: true, message: 'OTP sent to Slack' });
});

// Endpoint: Verify OTP
app.post('/api/verify-otp', (req, res) => {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
        return res.status(400).json({ error: 'User ID and OTP are required' });
    }

    const record = otpStore.get(userId);
    if (!record) {
        return res.status(400).json({ error: 'No OTP found for this user' });
    }

    if (Date.now() > record.expires) {
        otpStore.delete(userId);
        return res.status(400).json({ error: 'OTP has expired' });
    }

    if (record.code !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Success - clear OTP
    otpStore.delete(userId);
    res.json({ success: true, message: 'OTP verified' });
});

// Proxy for Token
app.use('/get-token', createProxyMiddleware({
    target: TOKEN_ENDPOINT,
    changeOrigin: true,
    secure: false,
    logLevel: 'debug',
    pathRewrite: {
        '^/': '/get-token', // Add /get-token back to the path since app.use strips it
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[Token Proxy] Request: ${req.method} ${req.url} -> ${TOKEN_ENDPOINT}${req.url}`);
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`[Token Proxy] Response: ${proxyRes.statusCode} ${req.url}`);
    },
    onError: (err, req, res) => {
        console.error('[Token Proxy] Error:', err);
        res.status(500).send('Proxy Error');
    }
}));

// Proxy for Salesforce API
app.use('/api', createProxyMiddleware({
    target: SALESFORCE_PROXY_URL,
    changeOrigin: true,
    secure: false,
    logLevel: 'debug',
    pathRewrite: {
        '^/': '/api', // Add /api back to the path since app.use strips it
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[API Proxy] Request: ${req.method} ${req.url} -> ${SALESFORCE_PROXY_URL}${req.url}`);
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`[API Proxy] Response: ${proxyRes.statusCode} ${req.url}`);
    },
    onError: (err, req, res) => {
        console.error('[API Proxy] Error:', err);
        res.status(500).send('Proxy Error');
    }
}));

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle SPA routing: return index.html for all other requests
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Token Endpoint: ${TOKEN_ENDPOINT}`);
    console.log(`Salesforce Proxy: ${SALESFORCE_PROXY_URL}`);
});
