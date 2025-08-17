const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`
    <html>
    <head><title>ADK UI</title></head>
    <body style="font-family: Arial; padding: 40px;">
        <h1>🎛️ ADK UI - Agent Management</h1>
        <p>Status: Running on port ${port}</p>
        <p>API: ${process.env.API_BASE_URL}</p>
        <button onclick="fetch('${process.env.API_BASE_URL}/health').then(r=>r.json()).then(d=>alert(JSON.stringify(d)))">Test ADK Health</button>
    </body>
    </html>
    `);
});

app.listen(port, () => {
    console.log(`🎛️ ADK UI on port ${port}`);
});
