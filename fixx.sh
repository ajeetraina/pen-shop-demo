#!/bin/bash

# Setup Pen Shop Demo - Following Sock Shop Pattern
# Run this script in your desired project directory

set -e

echo "🖋️  Setting up Pen Shop Demo in current directory..."
echo "📁 Current directory: $(pwd)"

# Create pen-catalogue directory
mkdir -p pen-catalogue

echo "📝 Creating Docker Compose configuration..."

# Create compose.yaml
cat > compose.yaml << 'EOF'
services:
  # Pen Shop Frontend
  pen-front-end:
    image: nginxinc/nginx-unprivileged:alpine
    ports:
      - "9091:8080"
    volumes:
      - ./index.html:/usr/share/nginx/html/index.html:ro
    networks:
      - pen-shop-network

  # Pen Catalog HTTP API (like sock-shop catalogue)
  pen-catalogue:
    build: ./pen-catalogue
    ports:
      - "9092:8080"
    environment:
      - PORT=8080
    networks:
      - pen-shop-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # MCP Gateway - Following Sock-Shop Pattern
  mcp-gateway:
    image: docker/mcp-gateway:latest
    ports:
      - "8080:8080"
    environment:
      - MCP_GATEWAY_PORT=8080
    command:
      - --transport=sse
      - --port=8080
      - --servers=fetch,brave,mongodb,curl
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - pen-shop-network
    depends_on:
      - mongodb
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # MongoDB for MCP servers
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_DATABASE=penstore
    volumes:
      - mongodb_data:/data/db
      - ./init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js:ro
    networks:
      - pen-shop-network

networks:
  pen-shop-network:
    driver: bridge

volumes:
  mongodb_data:
EOF

echo "⚙️  Creating MCP Gateway configuration with all servers..."

# Get current directory name for network name
CURRENT_DIR=$(basename "$(pwd)")

# Create mcp-config.json with proper network name
cat > mcp-config.json << EOF
{
  "mcpServers": {
    "fetch": {
      "command": "docker",
      "args": ["run", "--rm", "--network", "${CURRENT_DIR}_pen-shop-network", "mcp/fetch"]
    },
    "brave": {
      "command": "docker", 
      "args": ["run", "--rm", "--network", "${CURRENT_DIR}_pen-shop-network", "mcp/brave"]
    },
    "mongodb": {
      "command": "docker",
      "args": ["run", "--rm", "--network", "${CURRENT_DIR}_pen-shop-network", "--env", "MONGODB_URI=mongodb://mongodb:27017/penstore", "mcp/mongodb"]
    },
    "curl": {
      "command": "docker",
      "args": ["run", "--rm", "--network", "${CURRENT_DIR}_pen-shop-network", "mcp/curl"]
    },
    "resend": {
      "command": "docker",
      "args": ["run", "--rm", "--network", "${CURRENT_DIR}_pen-shop-network", "mcp/resend"]
    },
    "postgresql": {
      "command": "docker",
      "args": ["run", "--rm", "--network", "${CURRENT_DIR}_pen-shop-network", "mcp/postgresql"]
    }
  }
}
EOF

echo "🗃️  Creating MongoDB initialization script..."

# Create init-mongo.js
cat > init-mongo.js << 'EOF'
// MongoDB initialization script for Pen Store
db = db.getSiblingDB('penstore');

// Create collections
db.createCollection('pens');
db.createCollection('orders');
db.createCollection('customers');

// Insert sample pen data
db.pens.insertMany([
  {
    _id: "mont-blanc-149",
    name: "Montblanc Meisterstück 149 Fountain Pen",
    brand: "Montblanc",
    price: 750.00,
    type: "fountain",
    inStock: true,
    quantity: 15
  },
  {
    _id: "parker-sonnet", 
    name: "Parker Sonnet Fountain Pen",
    brand: "Parker",
    price: 145.00,
    type: "fountain", 
    inStock: true,
    quantity: 32
  },
  {
    _id: "pilot-metropolitan",
    name: "Pilot Metropolitan Fountain Pen", 
    brand: "Pilot",
    price: 18.00,
    type: "fountain",
    inStock: true,
    quantity: 85
  }
]);

print("✅ Pen Store database initialized successfully!");
EOF

echo "📦 Creating pen-catalogue package.json..."

# Create pen-catalogue/package.json
cat > pen-catalogue/package.json << 'EOF'
{
  "name": "pen-catalogue-api",
  "version": "1.0.0",
  "description": "Pen Shop Catalogue HTTP API",
  "main": "app.js",
  "type": "module",
  "scripts": {
    "start": "node app.js",
    "dev": "node --watch app.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "author": "Pen Shop Demo",
  "license": "MIT"
}
EOF

echo "🚀 Creating pen-catalogue API server..."

# Create pen-catalogue/app.js
cat > pen-catalogue/app.js << 'EOF'
#!/usr/bin/env node
// Pen Catalogue HTTP API Server
// Simple HTTP API like sock-shop catalogue service

import express from 'express';
import cors from 'cors';

// Pen inventory data
const PEN_INVENTORY = [
  {
    id: "mont-blanc-149",
    name: "Montblanc Meisterstück 149 Fountain Pen",
    description: "The flagship fountain pen with 18k gold nib",
    price: 750.00,
    currency: "USD",
    brand: "Montblanc",
    type: "fountain",
    nib: "18k gold",
    color: "black",
    material: "precious resin",
    availability: "in_stock",
    quantity: 15,
    images: ["https://example.com/mont-blanc-149.jpg"],
    tags: ["luxury", "fountain", "gold nib"]
  },
  {
    id: "parker-sonnet",
    name: "Parker Sonnet Fountain Pen",
    description: "Classic design with stainless steel nib",
    price: 145.00,
    currency: "USD",
    brand: "Parker",
    type: "fountain",
    nib: "stainless steel",
    color: "black lacquer",
    material: "lacquer",
    availability: "in_stock", 
    quantity: 32,
    images: ["https://example.com/parker-sonnet.jpg"],
    tags: ["classic", "fountain", "steel nib"]
  },
  {
    id: "pilot-metropolitan",
    name: "Pilot Metropolitan Fountain Pen",
    description: "Affordable fountain pen perfect for beginners",
    price: 18.00,
    currency: "USD",
    brand: "Pilot",
    type: "fountain", 
    nib: "steel",
    color: "black",
    material: "brass",
    availability: "in_stock",
    quantity: 85,
    images: ["https://example.com/pilot-metro.jpg"],
    tags: ["affordable", "beginner", "fountain"]
  },
  {
    id: "cross-century",
    name: "Cross Century II Ballpoint Pen",
    description: "Professional ballpoint with classic styling",
    price: 65.00,
    currency: "USD",
    brand: "Cross",
    type: "ballpoint",
    color: "chrome",
    material: "chrome",
    availability: "in_stock",
    quantity: 42,
    images: ["https://example.com/cross-century.jpg"],
    tags: ["professional", "ballpoint", "chrome"]
  },
  {
    id: "waterman-hemisphere", 
    name: "Waterman Hemisphere Rollerball",
    description: "Elegant rollerball with smooth writing experience",
    price: 89.00,
    currency: "USD",
    brand: "Waterman",
    type: "rollerball",
    color: "matte black",
    material: "lacquer",
    availability: "low_stock",
    quantity: 3,
    images: ["https://example.com/waterman-hemisphere.jpg"],
    tags: ["elegant", "rollerball", "smooth"]
  }
];

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'pen-catalogue' });
});

// Get all pens
app.get('/catalogue', (req, res) => {
  const { brand, type, page = 1, size = 10 } = req.query;
  let filteredPens = PEN_INVENTORY;

  // Filter by brand
  if (brand) {
    filteredPens = filteredPens.filter(pen => 
      pen.brand.toLowerCase().includes(brand.toLowerCase())
    );
  }

  // Filter by type
  if (type) {
    filteredPens = filteredPens.filter(pen => 
      pen.type.toLowerCase() === type.toLowerCase()
    );
  }

  // Pagination
  const startIndex = (page - 1) * size;
  const endIndex = startIndex + parseInt(size);
  const paginatedPens = filteredPens.slice(startIndex, endIndex);

  res.json({
    pens: paginatedPens,
    pagination: {
      page: parseInt(page),
      size: parseInt(size),
      total: filteredPens.length,
      hasNext: endIndex < filteredPens.length
    }
  });
});

// Get pen by ID
app.get('/catalogue/:id', (req, res) => {
  const pen = PEN_INVENTORY.find(p => p.id === req.params.id);
  
  if (!pen) {
    return res.status(404).json({ error: 'Pen not found' });
  }
  
  res.json(pen);
});

// Get pen brands
app.get('/brands', (req, res) => {
  const brands = [...new Set(PEN_INVENTORY.map(pen => pen.brand))];
  res.json({ brands });
});

// Get pen types
app.get('/types', (req, res) => {
  const types = [...new Set(PEN_INVENTORY.map(pen => pen.type))];
  res.json({ types });
});

// Search pens
app.get('/search', (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Query parameter required' });
  }
  
  const searchTerm = q.toLowerCase();
  const results = PEN_INVENTORY.filter(pen => 
    pen.name.toLowerCase().includes(searchTerm) ||
    pen.description.toLowerCase().includes(searchTerm) ||
    pen.brand.toLowerCase().includes(searchTerm) ||
    pen.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
  
  res.json({ results, count: results.length });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Pen Catalogue API running on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  GET /health`);
  console.log(`  GET /catalogue`);
  console.log(`  GET /catalogue/:id`);
  console.log(`  GET /brands`);
  console.log(`  GET /types`);
  console.log(`  GET /search?q=<term>`);
});
EOF

echo "🐳 Creating Dockerfile for pen-catalogue..."

# Create pen-catalogue/Dockerfile
cat > pen-catalogue/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Start the application
CMD ["node", "app.js"]
EOF

echo "🌐 Creating frontend HTML..."

# Create index.html
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pen Shop - Premium Writing Instruments</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        header {
            background: #2c3e50;
            color: white;
            padding: 1rem 0;
            margin-bottom: 2rem;
        }
        
        h1 {
            text-align: center;
            margin-bottom: 0.5rem;
        }
        
        .subtitle {
            text-align: center;
            opacity: 0.8;
        }
        
        .api-info {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .pen-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .pen-card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        
        .pen-card:hover {
            transform: translateY(-5px);
        }
        
        .pen-name {
            font-size: 1.2rem;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .pen-brand {
            color: #3498db;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .pen-price {
            font-size: 1.5rem;
            color: #e74c3c;
            font-weight: bold;
            margin: 10px 0;
        }
        
        .btn {
            background: #3498db;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: background 0.3s ease;
        }
        
        .btn:hover {
            background: #2980b9;
        }
        
        .status {
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: bold;
        }
        
        .in-stock {
            background: #d4edda;
            color: #155724;
        }
        
        .low-stock {
            background: #fff3cd;
            color: #856404;
        }
        
        .endpoint {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>🖋️ Pen Shop</h1>
            <p class="subtitle">Premium Writing Instruments & Fine Stationery</p>
        </div>
    </header>

    <div class="container">
        <div class="api-info">
            <h2>🔗 API Endpoints</h2>
            <p><strong>Pen Catalogue API:</strong> <a href="http://localhost:9092">http://localhost:9092</a></p>
            <p><strong>MCP Gateway:</strong> <a href="http://localhost:8080">http://localhost:8080</a></p>
            
            <h3>Available Endpoints:</h3>
            <div class="endpoint">GET /catalogue - List all pens</div>
            <div class="endpoint">GET /catalogue/:id - Get specific pen</div>
            <div class="endpoint">GET /brands - List all brands</div>
            <div class="endpoint">GET /types - List all pen types</div>
            <div class="endpoint">GET /search?q=term - Search pens</div>
        </div>

        <div class="pen-grid" id="penGrid">
            <!-- Pens will be loaded here -->
        </div>
    </div>

    <script>
        // Load pens from API
        async function loadPens() {
            try {
                const response = await fetch('http://localhost:9092/catalogue');
                const data = await response.json();
                displayPens(data.pens);
            } catch (error) {
                console.error('Error loading pens:', error);
                document.getElementById('penGrid').innerHTML = 
                    '<p>Unable to load pens. Make sure the API is running on port 9092.</p>';
            }
        }

        function displayPens(pens) {
            const grid = document.getElementById('penGrid');
            grid.innerHTML = pens.map(pen => `
                <div class="pen-card">
                    <div class="pen-brand">${pen.brand}</div>
                    <div class="pen-name">${pen.name}</div>
                    <p>${pen.description}</p>
                    <div class="pen-price">$${pen.price.toFixed(2)}</div>
                    <div class="status ${pen.availability.replace('_', '-')}">${pen.availability.replace('_', ' ')}</div>
                    <p><strong>Quantity:</strong> ${pen.quantity}</p>
                    <p><strong>Type:</strong> ${pen.type}</p>
                    ${pen.nib ? `<p><strong>Nib:</strong> ${pen.nib}</p>` : ''}
                    <button class="btn" onclick="viewPen('${pen.id}')">View Details</button>
                </div>
            `).join('');
        }

        function viewPen(id) {
            window.open(`http://localhost:9092/catalogue/${id}`, '_blank');
        }

        // Load pens when page loads
        loadPens();
    </script>
</body>
</html>
EOF

echo "📄 Creating README documentation..."

# Create README.md
cat > README.md << 'EOF'
# 🖋️ Pen Shop Demo

A demo e-commerce application for premium writing instruments, built following the **sock-shop pattern** for MCP Gateway integration.

## 🏗️ Architecture

- **Frontend**: Simple HTML/CSS/JS served by Nginx
- **Pen Catalogue API**: Node.js Express HTTP API (like sock-shop catalogue)
- **MCP Gateway**: Docker Hub MCP servers for AI agent integration
- **MongoDB**: Data persistence

## 🚀 Quick Start

```bash
# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

## 🌐 Services

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:9091 | Pen shop website |
| Pen API | http://localhost:9092 | Catalogue HTTP API |
| MCP Gateway | http://localhost:8080 | AI agent tools |
| MongoDB | localhost:27017 | Database |

## 🔗 API Endpoints

```bash
# Get all pens
curl http://localhost:9092/catalogue

# Get specific pen
curl http://localhost:9092/catalogue/mont-blanc-149

# Search pens
curl "http://localhost:9092/search?q=fountain"

# Get brands
curl http://localhost:9092/brands
```

## 🤖 MCP Integration

The MCP Gateway provides AI agents with:
- **fetch**: Web scraping capabilities
- **brave**: Web search functionality  
- **mongodb**: Database operations
- **curl**: HTTP requests

Key settings:
- Uses `docker/mcp-gateway:latest` image
- Docker socket mounted for container management
- MCP servers configured via command-line arguments
- SSE transport protocol on port 8080

## 📂 Project Structure

```
pen-shop-demo/
├── compose.yaml           # Docker Compose configuration
├── index.html            # Frontend
├── init-mongo.js         # MongoDB initialization
└── pen-catalogue/        # HTTP API service
    ├── app.js
    ├── package.json
    └── Dockerfile
```

## 🎯 Following Sock-Shop Pattern

✅ **Docker Hub MCP Gateway image**
✅ **Docker socket mounted**
✅ **HTTP API for business logic**
✅ **Standard compose.yaml structure**
✅ **SSE transport protocol**
✅ **Command-line MCP server configuration**

This ensures compatibility with MCP Gateway and AI agent frameworks.
EOF

echo "🔧 Creating convenience scripts..."

# Create start script
cat > start.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Pen Shop Demo..."
docker compose up -d
echo "✅ Services started!"
echo "🌐 Frontend: http://localhost:9091"
echo "📦 API: http://localhost:9092"
echo "🤖 MCP Gateway: http://localhost:8080"
EOF

# Create stop script  
cat > stop.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping Pen Shop Demo..."
docker compose down
echo "✅ Services stopped!"
EOF

# Create logs script
cat > logs.sh << 'EOF'
#!/bin/bash
echo "📋 Viewing Pen Shop logs..."
docker compose logs -f
EOF

# Create test script
cat > test-api.sh << 'EOF'
#!/bin/bash
echo "🧪 Testing Pen Shop API..."
echo ""
echo "🔍 Testing health endpoint..."
curl -s http://localhost:9092/health | jq '.'
echo ""
echo "📦 Testing catalogue endpoint..."
curl -s http://localhost:9092/catalogue | jq '.pens[0]'
echo ""
echo "🏷️ Testing brands endpoint..."
curl -s http://localhost:9092/brands | jq '.'
echo ""
echo "✅ API tests complete!"
EOF

# Make scripts executable
chmod +x start.sh stop.sh logs.sh test-api.sh

echo "📦 Installing pen-catalogue dependencies..."
cd pen-catalogue
if command -v npm &> /dev/null; then
    npm install
    echo "✅ Dependencies installed!"
else
    echo "⚠️  npm not found. Run 'npm install' in pen-catalogue/ directory"
fi
cd ..

echo ""
echo "🎉 Pen Shop Demo setup complete!"
echo ""
echo "📁 Files created in current directory: $(pwd)"
echo ""
echo "🚀 To start:"
echo "   ./start.sh"
echo ""
echo "🌐 URLs:"
echo "   Frontend:    http://localhost:9091"
echo "   API:         http://localhost:9092"
echo "   MCP Gateway: http://localhost:8080"
echo ""
echo "🧪 To test API:"
echo "   ./test-api.sh"
echo ""
echo "🛑 To stop:"
echo "   ./stop.sh"
echo ""
echo "📋 To view logs:"
echo "   ./logs.sh"
echo ""
echo "✨ Ready for MCP Gateway integration!"
echo ""
echo "🔧 MCP Servers configured:"
echo "   • fetch (web scraping)"
echo "   • brave (web search)" 
echo "   • mongodb (database)"
echo "   • curl (HTTP requests)"
