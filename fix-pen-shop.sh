#!/bin/bash

# Fix Pen Shop Demo for MCP Gateway Integration
# This script updates all necessary files to make the demo work properly

set -e

echo "🖋️  Fixing Pen Shop Demo for MCP Gateway Integration..."
echo "======================================================"

# Check if we're in the right directory
if [ ! -f "compose.yaml" ]; then
    echo "❌ Error: compose.yaml not found. Please run this script from the pen-shop-demo root directory."
    exit 1
fi

# Backup existing files
echo "📁 Creating backups..."
cp compose.yaml compose.yaml.backup-$(date +%Y%m%d-%H%M%S)
if [ -f "pen-catalog-mcp/pen-catalog-server.js" ]; then
    cp pen-catalog-mcp/pen-catalog-server.js pen-catalog-mcp/pen-catalog-server.js.backup-$(date +%Y%m%d-%H%M%S)
fi

# 1. Update compose.yaml
echo "📝 Updating compose.yaml..."
cat > compose.yaml << 'EOF'
services:
  # Frontend with your custom UI
  pen-front-end:
    image: nginxinc/nginx-unprivileged:alpine
    ports:
      - "9091:8080"
    volumes:
      - ./index.html:/usr/share/nginx/html/index.html:ro
    networks:
      - pen-shop-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8080"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Main MongoDB instance
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
      - MONGO_INITDB_DATABASE=penstore
    networks:
      - pen-shop-network
    command: [mongod, --quiet, --logpath, /var/log/mongodb/mongod.log, --logappend]
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Pen Catalogue MCP Server (builds image for MCP Gateway to use)
  pen-catalogue-mcp:
    build:
      context: ./pen-catalog-mcp
      dockerfile: Dockerfile
    image: pen-shop-demo-pen-catalogue-mcp
    # This service doesn't run standalone - it's used by MCP Gateway
    profiles:
      - build-only

  # MCP Gateway - properly configured
  mcp-gateway:
    image: docker/mcp-gateway:latest
    ports:
      - "8811:8811"
    networks:
      - pen-shop-network
    command:
      - --transport=sse
      - --servers=pen-catalog,mongodb,fetch
      - --config=/mcp_config
      - --secrets=docker-desktop:/run/secrets/mcp_secret
      - --verbose
    configs:
      - mcp_config
    secrets:
      - mcp_secret
    depends_on:
      - mongodb
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8811/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ADK Service - properly configured to use MCP Gateway
  adk:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - PYTHONPATH=/app
      - MCPGATEWAY_ENDPOINT=http://mcp-gateway:8811/sse
      - OPENAI_BASE_URL=https://api.openai.com/v1
      - AI_DEFAULT_MODEL=openai/gpt-4
    networks:
      - pen-shop-network
    depends_on:
      - mcp-gateway
    secrets:
      - openai-api-key
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ADK UI Service
  adk-ui:
    build:
      context: .
      dockerfile: Dockerfile.adk-ui
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - API_BASE_URL=http://adk:8000
    networks:
      - pen-shop-network
    depends_on:
      - adk
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  pen-shop-network:
    driver: bridge

volumes:
  mongodb_data:
    driver: local

# MCP Gateway Configuration
configs:
  mcp_config:
    content: |
      pen-catalog:
        enabled: true
        command: ["node", "pen-catalog-server.js"]
        image: pen-shop-demo-pen-catalogue-mcp
        transport: stdio
        timeout: 30s
      
      mongodb:
        enabled: true
        image: mcp/mongodb:latest
        transport: stdio
        environment:
          - MDB_MCP_CONNECTION_STRING=mongodb://admin:password@mongodb:27017/penstore?authSource=admin
        timeout: 30s
        
      fetch:
        enabled: true
        image: mcp/fetch:latest
        transport: stdio
        timeout: 30s

# Secrets for API keys and MCP configuration
secrets:
  openai-api-key:
    file: secret.openai-api-key
  mcp_secret:
    file: ./.mcp.env
EOF

# 2. Update .mcp.env
echo "📝 Updating .mcp.env..."
cat > .mcp.env << 'EOF'
# MCP Gateway Configuration
PEN_CATALOG_ENABLED=true
MONGODB_URL=mongodb://admin:password@mongodb:27017/penstore?authSource=admin
FETCH_ENABLED=true

# Security settings
MCP_GATEWAY_ALLOW_DOCKER_SOCKET=true
MCP_GATEWAY_RESOURCE_LIMIT_MEMORY=2Gb
MCP_GATEWAY_RESOURCE_LIMIT_CPU=1

# Logging
MCP_GATEWAY_LOG_LEVEL=debug
EOF

# 3. Create proper MCP server implementation
echo "📝 Creating proper MCP server implementation..."
cat > pen-catalog-mcp/pen-catalog-server.js << 'EOF'
#!/usr/bin/env node

// Proper Pen Catalog MCP Server
// Implements MCP protocol for pen shop demo

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

// Pen inventory data
const PEN_INVENTORY = [
  {
    id: "mont-blanc-149",
    name: "Montblanc Meisterstück 149",
    brand: "Montblanc",
    category: "luxury",
    price: 745,
    description: "Premium fountain pen with 14k gold nib",
    in_stock: true,
    stock_count: 12,
    image: "/images/montblanc-149.jpg"
  },
  {
    id: "parker-sonnet",
    name: "Parker Sonnet Premium",
    brand: "Parker",
    category: "premium", 
    price: 245,
    description: "Elegant ballpoint with gold trim",
    in_stock: true,
    stock_count: 25,
    image: "/images/parker-sonnet.jpg"
  },
  {
    id: "pilot-custom-74",
    name: "Pilot Custom 74",
    brand: "Pilot",
    category: "premium",
    price: 165,
    description: "Japanese fountain pen with 14k gold nib",
    in_stock: true,
    stock_count: 8,
    image: "/images/pilot-custom-74.jpg"
  },
  {
    id: "lamy-safari",
    name: "Lamy Safari",
    brand: "Lamy",
    category: "everyday",
    price: 35,
    description: "Durable fountain pen for daily use",
    in_stock: true,
    stock_count: 45,
    image: "/images/lamy-safari.jpg"
  }
];

// Create MCP Server
const server = new Server(
  {
    name: 'pen-catalog',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_pen_catalog',
        description: 'Get the complete pen catalog with all available pens',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'search_pens',
        description: 'Search for pens by brand, category, or price range',
        inputSchema: {
          type: 'object',
          properties: {
            brand: {
              type: 'string',
              description: 'Filter by pen brand (e.g., Montblanc, Parker, Pilot, Lamy)',
            },
            category: {
              type: 'string',
              description: 'Filter by category (luxury, premium, everyday)',
            },
            max_price: {
              type: 'number',
              description: 'Maximum price filter',
            },
            min_price: {
              type: 'number',
              description: 'Minimum price filter',
            },
          },
        },
      },
      {
        name: 'get_pen_details',
        description: 'Get detailed information about a specific pen',
        inputSchema: {
          type: 'object',
          properties: {
            pen_id: {
              type: 'string',
              description: 'The ID of the pen to get details for',
            },
          },
          required: ['pen_id'],
        },
      },
      {
        name: 'check_stock',
        description: 'Check stock availability for a specific pen',
        inputSchema: {
          type: 'object',
          properties: {
            pen_id: {
              type: 'string',
              description: 'The ID of the pen to check stock for',
            },
          },
          required: ['pen_id'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_pen_catalog':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                total_pens: PEN_INVENTORY.length,
                pens: PEN_INVENTORY
              }, null, 2),
            },
          ],
        };

      case 'search_pens':
        let filteredPens = [...PEN_INVENTORY];
        
        if (args.brand) {
          filteredPens = filteredPens.filter(pen => 
            pen.brand.toLowerCase().includes(args.brand.toLowerCase())
          );
        }
        
        if (args.category) {
          filteredPens = filteredPens.filter(pen => 
            pen.category.toLowerCase() === args.category.toLowerCase()
          );
        }
        
        if (args.min_price) {
          filteredPens = filteredPens.filter(pen => pen.price >= args.min_price);
        }
        
        if (args.max_price) {
          filteredPens = filteredPens.filter(pen => pen.price <= args.max_price);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                results_found: filteredPens.length,
                pens: filteredPens
              }, null, 2),
            },
          ],
        };

      case 'get_pen_details':
        const pen = PEN_INVENTORY.find(p => p.id === args.pen_id);
        if (!pen) {
          throw new McpError(ErrorCode.InvalidRequest, `Pen with ID ${args.pen_id} not found`);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                pen: pen
              }, null, 2),
            },
          ],
        };

      case 'check_stock':
        const stockPen = PEN_INVENTORY.find(p => p.id === args.pen_id);
        if (!stockPen) {
          throw new McpError(ErrorCode.InvalidRequest, `Pen with ID ${args.pen_id} not found`);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                pen_id: stockPen.id,
                pen_name: stockPen.name,
                in_stock: stockPen.in_stock,
                stock_count: stockPen.stock_count,
                availability: stockPen.in_stock ? 'Available' : 'Out of Stock'
              }, null, 2),
            },
          ],
        };

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error.message}`);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🖋️ Pen Catalog MCP Server running');
  console.error('📋 Available tools: get_pen_catalog, search_pens, get_pen_details, check_stock');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
EOF

# 4. Update package.json for proper MCP dependencies
echo "📝 Updating pen-catalog-mcp/package.json..."
cat > pen-catalog-mcp/package.json << 'EOF'
{
  "name": "pen-catalog-mcp",
  "version": "1.0.0",
  "description": "Pen Catalog MCP Server for pen shop demo",
  "main": "pen-catalog-server.js",
  "type": "module",
  "scripts": {
    "start": "node pen-catalog-server.js",
    "dev": "node pen-catalog-server.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "keywords": ["mcp", "pen", "catalog", "demo"],
  "author": "Ajeet Raina",
  "license": "MIT"
}
EOF

# 5. Update Dockerfile for MCP server
echo "📝 Updating pen-catalog-mcp/Dockerfile..."
cat > pen-catalog-mcp/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy the MCP server code
COPY pen-catalog-server.js ./

# Create non-root user
RUN addgroup -g 1001 -S penuser && \
    adduser -S penuser -u 1001 -G penuser

# Set ownership
RUN chown -R penuser:penuser /app
USER penuser

# MCP servers run via stdio, not HTTP
# The server will be started by MCP Gateway
CMD ["node", "pen-catalog-server.js"]
EOF

# 6. Ensure .env file has required variables
echo "📝 Creating/updating .env file..."
if [ ! -f ".env" ]; then
    cat > .env << 'EOF'
MYSQL_ROOT_PASSWORD=password
EOF
else
    if ! grep -q "MYSQL_ROOT_PASSWORD" .env; then
        echo "MYSQL_ROOT_PASSWORD=password" >> .env
    fi
fi

# 7. Check OpenAI API key file
echo "🔑 Checking OpenAI API key file..."
if [ ! -f "secret.openai-api-key" ]; then
    echo "your-openai-api-key-here" > secret.openai-api-key
    echo "⚠️  IMPORTANT: Please update secret.openai-api-key with your actual OpenAI API key!"
fi

# 8. Clean up old package-lock.json if it exists (to avoid dependency conflicts)
if [ -f "pen-catalog-mcp/package-lock.json" ]; then
    echo "🧹 Cleaning up old package-lock.json..."
    rm pen-catalog-mcp/package-lock.json
fi

echo ""
echo "✅ All changes completed successfully!"
echo ""
echo "📋 Summary of changes:"
echo "   ✓ Updated compose.yaml with proper MCP Gateway configuration"
echo "   ✓ Replaced HTTP API with proper MCP server implementation"
echo "   ✓ Updated package.json with MCP SDK dependencies"
echo "   ✓ Updated Dockerfile for MCP server"
echo "   ✓ Updated .mcp.env with proper configuration"
echo "   ✓ Ensured .env file has required variables"
echo ""
echo "🚀 Next steps:"
echo "   1. Update secret.openai-api-key with your actual OpenAI API key"
echo "   2. Run: docker compose build"
echo "   3. Run: docker compose up"
echo ""
echo "🌐 Services will be available at:"
echo "   • Web Interface: http://localhost:9091"
echo "   • ADK UI: http://localhost:3000"
echo "   • ADK API: http://localhost:8000"
echo "   • MCP Gateway: http://localhost:8811"
echo ""
echo "🔧 Troubleshooting:"
echo "   • Check logs: docker compose logs mcp-gateway"
echo "   • Test MCP: curl http://localhost:8811/health"
echo "   • Check ADK: curl http://localhost:8000/health"
echo ""
echo "🎯 The pen-catalog MCP server now provides these tools:"
echo "   • get_pen_catalog - Get all available pens"
echo "   • search_pens - Search by brand, category, price"
echo "   • get_pen_details - Get specific pen information"
echo "   • check_stock - Check pen availability"
EOF
chmod +x fix-pen-shop.sh

echo "🎉 Script created successfully!"
echo ""
echo "📄 To apply all the fixes, run:"
echo "   ./fix-pen-shop.sh"
echo ""
echo "⚠️  Important: Make sure you're in the pen-shop-demo directory before running the script!"
