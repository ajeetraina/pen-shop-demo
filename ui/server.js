const express = require('express');
const app = express();
const PORT = 3000;
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'pen-shop-ui' });
});

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>🖋️ Pen Shop UI</title></head>
    <body>
        <h1>🖋️ Premium Pen Emporium</h1>
        <p>Secure UI Interface</p>
        <p>Agent API: ${API_BASE_URL}</p>
        <p>✅ All services running securely</p>
    </body>
    </html>
    `);
});

app.listen(PORT, () => {
    console.log(`🖋️ Pen Shop UI running on port ${PORT}`);
});
