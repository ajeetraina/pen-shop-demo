const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;
const SECURITY_CHECKS = process.env.SECURITY_CHECKS === 'true';

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
});

app.use(express.json());

// MCP Tools
const tools = {
    search_inventory: require('./tools/search'),
    get_pen_details: require('./tools/inventory'),
    process_order: require('./tools/orders')
};

// MCP protocol endpoints
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
        // Security check (if enabled)
        if (SECURITY_CHECKS && args.query) {
            const suspiciousPatterns = [
                /drop\s+table/i,
                /delete\s+from/i,
                /union\s+select/i
            ];
            
            if (suspiciousPatterns.some(pattern => pattern.test(args.query))) {
                return res.status(400).json({ 
                    error: 'Potentially malicious query detected' 
                });
            }
        }

        const result = await tools[toolName].execute(args, pool);
        res.json({ result });
    } catch (error) {
        console.error(`Error executing tool ${toolName}:`, error);
        res.status(500).json({ 
            error: SECURITY_CHECKS ? 'Tool execution failed' : error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`📦 Pen Inventory MCP Server running on port ${PORT}`);
    console.log(`🛡️  Security checks: ${SECURITY_CHECKS ? 'ENABLED' : 'DISABLED'}`);
});
