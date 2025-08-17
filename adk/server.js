const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        service: 'pen-shop-adk',
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.json({
        message: '🖋️ Pen Shop ADK - Paper Search Agent',
        status: 'running',
        mcpGateway: process.env.MCPGATEWAY_ENDPOINT
    });
});

app.post('/search', (req, res) => {
    const { query } = req.body;
    res.json({
        results: [
            {
                title: `Research on ${query}`,
                authors: 'Demo Authors',
                source: 'arXiv',
                abstract: `This is a demo paper about ${query}.`
            }
        ],
        query: query,
        note: 'Demo results from Paper-Search MCP'
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`🖋️ ADK running on port ${port}`);
});
