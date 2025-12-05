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

// Proxy for Token
app.use('/get-token', createProxyMiddleware({
    target: TOKEN_ENDPOINT,
    changeOrigin: true,
    secure: false,
    logLevel: 'debug',
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
});
