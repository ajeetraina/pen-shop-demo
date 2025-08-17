#!/bin/bash

# Fix missing files for MCP Security Demo
echo "🔧 Creating missing files..."

# Customer Service MCP Server
cat > mcp-servers/customer-service/Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
EOF

cat > mcp-servers/customer-service/package.json << 'EOF'
{
  "name": "customer-service-mcp",
  "version": "1.0.0",
  "description": "MCP server for customer service",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.0"
  }
}
EOF

cat > mcp-servers/customer-service/server.js << 'EOF'
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
EOF

cat > mcp-servers/customer-service/tools/support.js << 'EOF'
module.exports = {
    description: "Get customer information for support purposes",
    schema: {
        type: "object",
        properties: {
            customer_email: { type: "string" },
            customer_id: { type: "number" }
        }
    },
    
    async execute(args, pool) {
        const { customer_email, customer_id } = args;
        
        let query = "SELECT * FROM customers WHERE 1=1";
        const params = [];
        
        if (customer_email) {
            query += " AND email = $" + (params.length + 1);
            params.push(customer_email);
        }
        
        if (customer_id) {
            query += " AND id = $" + (params.length + 1);
            params.push(customer_id);
        }
        
        const result = await pool.query(query, params);
        
        // Vulnerable: Returns sensitive data including credit cards
        return {
            customers: result.rows,
            admin_note: "Full customer data including payment info"
        };
    }
};
EOF

cat > mcp-servers/customer-service/tools/analytics.js << 'EOF'
module.exports = {
    description: "Get customer analytics and statistics",
    schema: {
        type: "object",
        properties: {
            metric: { type: "string" },
            period: { type: "string", default: "month" }
        }
    },
    
    async execute(args, pool) {
        const { metric = "all", period = "month" } = args;
        
        // Vulnerable: Exposes business metrics and customer data
        const queries = {
            customers: "SELECT COUNT(*) as total, AVG(LENGTH(credit_card)) as avg_cc_length FROM customers",
            orders: "SELECT COUNT(*) as total_orders, SUM(total_amount) as revenue FROM orders",
            admin_users: "SELECT username, password, api_key FROM admin_users"
        };
        
        const results = {};
        
        if (metric === "all" || metric === "customers") {
            const customerResult = await pool.query(queries.customers);
            results.customers = customerResult.rows[0];
        }
        
        if (metric === "all" || metric === "orders") {
            const orderResult = await pool.query(queries.orders);
            results.orders = orderResult.rows[0];
        }
        
        if (metric === "admin" || metric === "all") {
            // Extremely vulnerable: Exposes admin credentials
            const adminResult = await pool.query(queries.admin_users);
            results.admin_users = adminResult.rows;
        }
        
        return {
            analytics: results,
            warning: "This data should be protected!"
        };
    }
};
EOF

# Complete the inventory tools
cat > mcp-servers/pen-inventory/tools/inventory.js << 'EOF'
module.exports = {
    description: "Get detailed pen information by ID",
    schema: {
        type: "object",
        properties: {
            pen_id: { type: "number" },
            include_sensitive: { type: "boolean", default: false }
        },
        required: ["pen_id"]
    },
    
    async execute(args, pool) {
        const { pen_id, include_sensitive = false } = args;
        
        const query = `
            SELECT p.*, c.name as category_name 
            FROM pens p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.id = $1
        `;
        
        const result = await pool.query(query, [pen_id]);
        
        if (result.rows.length === 0) {
            throw new Error('Pen not found');
        }
        
        const pen = result.rows[0];
        
        // Vulnerable: Exposes sensitive data when requested
        if (include_sensitive) {
            const adminQuery = "SELECT * FROM admin_users LIMIT 1";
            const adminResult = await pool.query(adminQuery);
            pen.admin_access = adminResult.rows[0];
        }
        
        return pen;
    }
};
EOF

cat > mcp-servers/pen-inventory/tools/orders.js << 'EOF'
module.exports = {
    description: "Process pen orders",
    schema: {
        type: "object",
        properties: {
            pen_id: { type: "number" },
            customer_email: { type: "string" },
            quantity: { type: "number", default: 1 }
        },
        required: ["pen_id", "customer_email"]
    },
    
    async execute(args, pool) {
        const { pen_id, customer_email, quantity = 1 } = args;
        
        // Get customer
        const customerQuery = "SELECT * FROM customers WHERE email = $1";
        const customerResult = await pool.query(customerQuery, [customer_email]);
        
        if (customerResult.rows.length === 0) {
            throw new Error('Customer not found');
        }
        
        const customer = customerResult.rows[0];
        
        // Get pen
        const penQuery = "SELECT * FROM pens WHERE id = $1";
        const penResult = await pool.query(penQuery, [pen_id]);
        
        if (penResult.rows.length === 0) {
            throw new Error('Pen not found');
        }
        
        const pen = penResult.rows[0];
        const total = pen.price * quantity;
        
        // Create order
        const orderQuery = `
            INSERT INTO orders (customer_id, pen_id, quantity, total_amount, status)
            VALUES ($1, $2, $3, $4, 'pending')
            RETURNING *
        `;
        
        const orderResult = await pool.query(orderQuery, [
            customer.id, pen_id, quantity, total
        ]);
        
        return {
            order: orderResult.rows[0],
            customer_info: customer, // Vulnerable: Exposes customer data
            pen_info: pen
        };
    }
};
EOF

# Add js-yaml dependency to gateway
cat > mcp-gateway/package.json << 'EOF'
{
  "name": "mcp-gateway",
  "version": "1.0.0",
  "description": "Security gateway for MCP servers",
  "main": "src/gateway.js",
  "scripts": {
    "start": "node src/gateway.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "helmet": "^7.0.0",
    "express-rate-limit": "^7.1.5",
    "winston": "^3.11.0",
    "cors": "^2.8.5",
    "js-yaml": "^4.1.0"
  }
}
EOF

# Create dashboard directory and files
mkdir -p monitoring/dashboard/{css,js}

cat > monitoring/dashboard/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MCP Security Dashboard</title>
    <link rel="stylesheet" href="css/dashboard.css">
</head>
<body>
    <header>
        <h1>🛡️ MCP Security Dashboard</h1>
        <div class="status">
            <span id="status-indicator" class="status-green">●</span>
            <span>Security Gateway Active</span>
        </div>
    </header>

    <main>
        <div class="metrics-grid">
            <div class="metric-card">
                <h3>Requests Today</h3>
                <div class="metric-value" id="total-requests">0</div>
            </div>
            <div class="metric-card blocked">
                <h3>Blocked Attacks</h3>
                <div class="metric-value" id="blocked-requests">0</div>
            </div>
            <div class="metric-card">
                <h3>Block Rate</h3>
                <div class="metric-value" id="block-rate">0%</div>
            </div>
        </div>

        <section class="events-section">
            <h2>🚨 Security Events</h2>
            <div id="security-events" class="events-container">
                <!-- Events will be populated here -->
            </div>
        </section>
    </main>

    <script src="js/dashboard.js"></script>
</body>
</html>
EOF

cat > monitoring/dashboard/css/dashboard.css << 'EOF'
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #1a1a1a;
    color: #ffffff;
    line-height: 1.6;
}

header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.status-green { color: #4caf50; }
.status-red { color: #f44336; }

main {
    padding: 2rem;
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.metric-card {
    background: #2d2d2d;
    padding: 1.5rem;
    border-radius: 8px;
    border-left: 4px solid #4caf50;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.metric-card.blocked {
    border-left-color: #f44336;
}

.metric-card h3 {
    font-size: 0.9rem;
    color: #aaa;
    margin-bottom: 0.5rem;
}

.metric-value {
    font-size: 2rem;
    font-weight: bold;
    color: #fff;
}

.events-section {
    background: #2d2d2d;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.events-container {
    max-height: 400px;
    overflow-y: auto;
}

.event {
    background: #3d3d3d;
    margin: 0.5rem 0;
    padding: 1rem;
    border-radius: 4px;
    border-left: 4px solid #4caf50;
}

.event.high { border-left-color: #f44336; }
.event.medium { border-left-color: #ff9800; }
.event.low { border-left-color: #4caf50; }

.event-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.event-type {
    font-weight: bold;
    text-transform: uppercase;
    font-size: 0.8rem;
}

.event-time {
    color: #aaa;
    font-size: 0.8rem;
}

.event-description {
    color: #ccc;
}
EOF

cat > monitoring/dashboard/js/dashboard.js << 'EOF'
class SecurityDashboard {
    constructor() {
        this.metrics = {
            total_requests: 0,
            blocked_requests: 0,
            block_rate: 0
        };
        this.init();
    }

    init() {
        this.updateMetrics();
        setInterval(() => this.updateMetrics(), 5000);
        this.loadRecentEvents();
    }

    async updateMetrics() {
        try {
            const response = await fetch('/api/metrics');
            const data = await response.json();
            
            this.metrics = data;
            this.renderMetrics();
        } catch (error) {
            console.error('Failed to fetch metrics:', error);
            this.showOfflineStatus();
        }
    }

    renderMetrics() {
        document.getElementById('total-requests').textContent = this.metrics.requests_total || 0;
        document.getElementById('blocked-requests').textContent = this.metrics.requests_blocked || 0;
        document.getElementById('block-rate').textContent = 
            (this.metrics.block_rate || 0).toFixed(1) + '%';
        
        // Update status indicator
        const indicator = document.getElementById('status-indicator');
        indicator.className = this.metrics.requests_total > 0 ? 'status-green' : 'status-red';
    }

    async loadRecentEvents() {
        try {
            const response = await fetch('/api/logs');
            const events = await response.json();
            this.renderEvents(events);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        }
    }

    renderEvents(events) {
        const container = document.getElementById('security-events');
        
        if (!events || events.length === 0) {
            container.innerHTML = '<p style="color: #aaa;">No security events yet...</p>';
            return;
        }

        container.innerHTML = events.map(event => `
            <div class="event ${event.severity || 'low'}">
                <div class="event-header">
                    <span class="event-type">${event.type || 'Unknown'}</span>
                    <span class="event-time">${new Date(event.timestamp).toLocaleTimeString()}</span>
                </div>
                <div class="event-description">
                    ${event.reason || 'Security event detected'}
                </div>
            </div>
        `).join('');
    }

    showOfflineStatus() {
        const indicator = document.getElementById('status-indicator');
        indicator.className = 'status-red';
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    new SecurityDashboard();
});
EOF

echo "✅ Missing files created successfully!"
echo ""
echo "Now run the build again:"
echo "make demo-vulnerable"
