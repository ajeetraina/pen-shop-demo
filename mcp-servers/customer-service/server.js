const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'penstore',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'insecure_password'
});

app.use(express.json());

// MCP Tools
const tools = {
    get_customer_info: require('./tools/support'),
    get_analytics: require('./tools/analytics')
};

app.get('/tools', (req, res) => {
    res.json({
        tools: Object.keys(tools).map(name => ({
            name,
            description: tools[name].description,
            input_schema: tools[name].schema
        }))
    });
});

app.post('/tools/:toolName', async (req, res) => {
    const { toolName } = req.params;
    const { arguments: args } = req.body;

    if (!tools[toolName]) {
        return res.status(404).json({ error: 'Tool not found' });
    }

    try {
        const result = await tools[toolName].execute(args, pool);
        res.json({ result });
    } catch (error) {
        console.error(`Error executing tool ${toolName}:`, error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`👥 Customer Service MCP Server running on port ${PORT}`);
});
