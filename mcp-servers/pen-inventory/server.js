const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;
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

// Log all requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] MCP Inventory: ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Request body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// MCP protocol endpoints
app.get('/tools', (req, res) => {
    const availableTools = Object.keys(tools).map(name => ({
        name,
        description: tools[name].description,
        input_schema: tools[name].schema
    }));
    
    console.log('Tools requested:', availableTools);
    res.json({ tools: availableTools });
});

app.post('/tools/:toolName', async (req, res) => {
    const { toolName } = req.params;
    const { arguments: args } = req.body;

    console.log(`Tool called: ${toolName} with args:`, args);

    if (!tools[toolName]) {
        console.log(`Tool not found: ${toolName}`);
        return res.status(404).json({ error: 'Tool not found' });
    }

    try {
        // Security check (if enabled)
        if (SECURITY_CHECKS && args.query) {
            const suspiciousPatterns = [
                /drop\s+table/i,
                /delete\s+from/i,
                /union\s+select/i,
                /--/,
                /\/\*/
            ];
            
            if (suspiciousPatterns.some(pattern => pattern.test(args.query))) {
                console.log('Suspicious query blocked:', args.query);
                return res.status(400).json({ 
                    error: 'Potentially malicious query detected' 
                });
            }
        }

        const result = await tools[toolName].execute(args, pool);
        console.log(`Tool ${toolName} result:`, result);
        
        res.json({ result });
    } catch (error) {
        console.error(`Error executing tool ${toolName}:`, error);
        res.status(500).json({ 
            error: SECURITY_CHECKS ? 'Tool execution failed' : error.message 
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        service: 'pen-inventory-mcp',
        security: SECURITY_CHECKS ? 'enabled' : 'disabled',
        tools: Object.keys(tools)
    });
});

app.listen(PORT, () => {
    console.log(`📦 Pen Inventory MCP Server running on port ${PORT}`);
    console.log(`🛡️  Security checks: ${SECURITY_CHECKS ? 'ENABLED' : 'DISABLED'}`);
    console.log(`🔧 Available tools: ${Object.keys(tools).join(', ')}`);
});
