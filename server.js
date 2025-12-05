import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Proxy for Token
app.use('/get-token', createProxyMiddleware({
    target: 'https://acme-dcunited-connector-app-58a61db33e61.herokuapp.com',
    changeOrigin: true,
    secure: false,
}));

// Proxy for Salesforce API
app.use('/api', createProxyMiddleware({
    target: 'https://mnrw0zbyh0yt0mldmmytqzrxg0.c360a.salesforce.com',
    changeOrigin: true,
    secure: false,
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
