#!/bin/bash

echo "🖋️ Setting up Complete Pen Shop Demo Project..."
echo "Based on adk-sock-shop structure with security focus"

# Create directory structure
mkdir -p data/mongodb
mkdir -p secrets
mkdir -p src

# 1. Create main compose.yaml (following adk-sock-shop exactly)
cat > compose.yaml << 'EOF'
services:
  # Pen Store front-end (adapted from sock shop)
  front-end:
    image: weaveworksdemos/front-end:0.3.12
    hostname: front-end
    ports:
      - 9090:8079
    restart: always
    cap_drop:
      - all
    read_only: true

  # Pen catalogue service
  catalogue:
    image: roberthouse224/catalogue:amd
    hostname: catalogue
    restart: always
    cap_drop:
      - all
    cap_add:
      - NET_BIND_SERVICE
    read_only: true
    ports:
      - 8081:80
    depends_on:
      - catalogue-db

  catalogue-db:
    image: weaveworksdemos/catalogue-db:0.3.0
    hostname: catalogue-db
    restart: always
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_ALLOW_EMPTY_PASSWORD=true
      - MYSQL_DATABASE=penstore

  # Customer Review Database
  mongodb:
    image: mongo:latest
    ports:
      - 27017:27017
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
      - MONGO_INITDB_DATABASE=penstore
    volumes:
      - ./data/mongodb:/docker-entrypoint-initdb.d:ro
      - mongodb_data:/data/db
    command: [mongod, --quiet, --logpath, /var/log/mongodb/mongod.log, --logappend, --setParameter, "logComponentVerbosity={network:{verbosity:0}}"]
    healthcheck:
      test: [CMD, mongosh, --eval, db.adminCommand('ping')]
      interval: 10s
      timeout: 5s
      retries: 5

  # Agent UI
  adk-ui:
    build:
      context: .
      dockerfile: Dockerfile.adk-ui
    ports:
      - 3000:3000
    environment:
      - API_BASE_URL=http://adk:8000
    depends_on:
      - adk

  # Agent
  adk:
    build:
      context: .
    ports:
      # expose port for web interface
      - 8000:8000
    environment:
      # point adk at the MCP gateway
      - MCPGATEWAY_ENDPOINT=http://mcp-gateway:8811/sse
      - CATALOGUE_URL=http://catalogue:8081
      - OPENAI_BASE_URL=https://api.openai.com/v1
      - AI_DEFAULT_MODEL=gpt-4
    depends_on:
      - mcp-gateway
    secrets:
      - openai-api-key
    models:
      qwen3:
        endpoint_var: MODEL_RUNNER_URL
        model_var: MODEL_RUNNER_MODEL

  mcp-gateway:
    # mcp-gateway secures your MCP servers
    image: docker/mcp-gateway:latest
    ports:
      - 8811:8811
    use_api_socket: true
    command:
      - --transport=sse
      - --servers=fetch,brave,resend,curl,mongodb
      - --config=/mcp_config
      - --secrets=docker-desktop:/run/secrets/mcp_secret
      - --verbose
    configs:
      - mcp_config
    secrets:
      - mcp_secret
    depends_on:
      - mongodb

models:
  qwen3:
    # pre-pull the model when starting Docker Model Runner
    model: ai/qwen3:4b

volumes:
  mongodb_data:

configs:
  mcp_config:
    content: |
      resend:
        reply_to: slimslenderslacks@gmail.com
        sender: slimslenderslacks@slimslenderslacks.com

secrets:
  openai-api-key:
    file: secret.openai-api-key
  mcp_secret:
    file: ./.mcp.env
EOF

# 2. Create main Dockerfile for ADK agent
cat > Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose the port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Run the application
CMD ["python", "main.py"]
EOF

# 3. Create requirements.txt
cat > requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn[standard]==0.24.0
google-adk==0.8.0
openai==1.50.0
pymongo==4.6.1
requests==2.31.0
pydantic==2.5.0
python-dotenv==1.0.0
mcp-client==0.7.0
jinja2==3.1.2
aiofiles==23.2.1
EOF

# 4. Create main.py (ADK agent application)
cat > main.py << 'EOF'
#!/usr/bin/env python3

import os
import asyncio
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Pen Shop Agent", version="1.0.0")

# Configuration
MCPGATEWAY_ENDPOINT = os.getenv('MCPGATEWAY_ENDPOINT', 'http://localhost:8811/sse')
CATALOGUE_URL = os.getenv('CATALOGUE_URL', 'http://localhost:8081')
SHOP_NAME = os.getenv('SHOP_NAME', 'Premium Pen Emporium')

# Templates
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Main pen shop interface"""
    return templates.TemplateResponse("index.html", {
        "request": request,
        "shop_name": SHOP_NAME,
        "gateway_url": MCPGATEWAY_ENDPOINT,
        "catalogue_url": CATALOGUE_URL
    })

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "service": "pen-shop-agent"}

@app.get("/api/status")
async def status():
    """Service status"""
    return {
        "adk_agent": "running",
        "mcp_gateway": MCPGATEWAY_ENDPOINT,
        "catalogue_service": CATALOGUE_URL,
        "shop_name": SHOP_NAME
    }

if __name__ == "__main__":
    print(f"🖋️ Starting {SHOP_NAME} Agent on port 8000")
    print(f"MCP Gateway: {MCPGATEWAY_ENDPOINT}")
    print(f"Catalogue URL: {CATALOGUE_URL}")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF

# 5. Create Dockerfile for UI
cat > Dockerfile.adk-ui << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY ui/ ./

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Run the application
CMD ["npm", "start"]
EOF

# 6. Create package.json for UI
cat > package.json << 'EOF'
{
  "name": "pen-shop-ui",
  "version": "1.0.0",
  "description": "Pen Shop Demo UI",
  "main": "ui/server.js",
  "scripts": {
    "start": "node ui/server.js",
    "dev": "node ui/server.js",
    "build": "echo 'No build step needed'"
  },
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.6.2"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# 7. Create UI directory and files
mkdir -p ui templates static

# 8. Create UI server
cat > ui/server.js << 'EOF'
const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

app.use(express.static('static'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'pen-shop-ui' });
});

// Main UI
app.get('/', async (req, res) => {
    try {
        const statusRes = await axios.get(`${API_BASE_URL}/api/status`);
        const status = statusRes.data;
        
        res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>🖋️ ${status.shop_name}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
                .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { text-align: center; margin-bottom: 30px; }
                .status { display: flex; gap: 20px; margin-bottom: 30px; }
                .status-item { flex: 1; padding: 15px; background: #e8f4f8; border-radius: 8px; text-align: center; }
                .status-item.active { background: #d4edda; }
                .demo-info { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🖋️ ${status.shop_name}</h1>
                    <p>Secure AI Agent Architecture Demo</p>
                </div>
                
                <div class="status">
                    <div class="status-item active">
                        <strong>🤖 ADK Agent</strong><br>Running
                    </div>
                    <div class="status-item active">
                        <strong>🛡️ MCP Gateway</strong><br>Protected
                    </div>
                    <div class="status-item active">
                        <strong>🗄️ Catalogue</strong><br>Connected
                    </div>
                </div>

                <div class="demo-info">
                    <h3>🎯 Security Architecture Demo</h3>
                    <p>This demonstrates the secure, containerized MCP architecture:</p>
                    <ul>
                        <li><strong>Container Isolation:</strong> Each service runs in isolated containers</li>
                        <li><strong>MCP Gateway:</strong> Filters and secures all tool access</li>
                        <li><strong>Supply Chain Security:</strong> Verified container images</li>
                        <li><strong>Zero Trust:</strong> No direct model exposure</li>
                    </ul>
                    <p><strong>API Endpoints:</strong></p>
                    <ul>
                        <li>Agent API: <code>${API_BASE_URL}</code></li>
                        <li>MCP Gateway: <code>${status.mcp_gateway}</code></li>
                        <li>Catalogue: <code>${status.catalogue_service}</code></li>
                    </ul>
                </div>
            </div>
        </body>
        </html>
        `);
    } catch (error) {
        res.status(500).send('Error connecting to agent service');
    }
});

app.listen(PORT, () => {
    console.log(`🖋️ Pen Shop UI running on port ${PORT}`);
    console.log(`API Base URL: ${API_BASE_URL}`);
});
EOF

# 9. Create templates for main app
cat > templates/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>🖋️ {{ shop_name }}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
        .header { text-align: center; margin-bottom: 30px; }
        .services { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .service { padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9; }
        .service.active { background: #d4edda; border-color: #28a745; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🖋️ {{ shop_name }}</h1>
            <p>Secure AI Agent Demo - "How to sell a pen safely in 2025"</p>
        </div>
        
        <div class="services">
            <div class="service active">
                <h3>🤖 ADK Agent</h3>
                <p>FastAPI-based agent using Google ADK</p>
                <small>Port: 8000</small>
            </div>
            <div class="service active">
                <h3>🛡️ MCP Gateway</h3>
                <p>Secure tool access and filtering</p>
                <small>{{ gateway_url }}</small>
            </div>
            <div class="service active">
                <h3>🗄️ Catalogue Service</h3>
                <p>Pen inventory and product data</p>
                <small>{{ catalogue_url }}</small>
            </div>
        </div>
    </div>
</body>
</html>
EOF

# 10. Create MongoDB initialization
cat > data/mongodb/init-penstore.js << 'EOF'
// Initialize pen store database
db = db.getSiblingDB('penstore');

// Create pen products collection
db.pens.insertMany([
  {
    id: "mont-149",
    name: "Montblanc Meisterstück 149",
    brand: "Montblanc",
    price: 745,
    category: "luxury",
    description: "Premium fountain pen with 14k gold nib",
    in_stock: true
  },
  {
    id: "parker-sonnet",
    name: "Parker Sonnet Premium",
    brand: "Parker", 
    price: 245,
    category: "professional",
    description: "Elegant fountain pen with stainless steel nib",
    in_stock: true
  },
  {
    id: "lamy-safari",
    name: "Lamy Safari",
    brand: "Lamy",
    price: 29,
    category: "entry",
    description: "Reliable starter fountain pen",
    in_stock: true
  }
]);

print("Pen store database initialized!");
EOF

# 11. Create environment files
cat > .env.example << 'EOF'
# Pen Shop Configuration
SHOP_NAME="Premium Pen Emporium"
MYSQL_ROOT_PASSWORD=secretpassword

# API Keys (add your real keys here)
OPENAI_API_KEY=your-openai-api-key-here
BRAVE_API_KEY=your-brave-search-api-key
EOF

cat > .mcp.env << 'EOF'
# MCP Server configuration
BRAVE_API_KEY=your-brave-search-api-key
RESEND_API_KEY=your-resend-api-key
EOF

# 12. Create secret files
echo "sk-your-openai-api-key-here" > secret.openai-api-key
echo "your-brave-search-api-key" > secrets/brave-api-key.txt
echo "your-openai-api-key" > secrets/openai-api-key.txt

# 13. Create Makefile
cat > Makefile << 'EOF'
.PHONY: help setup demo-local demo-secure clean logs health

help:
	@echo "🖋️ Pen Shop Demo Commands"
	@echo ""
	@echo "setup        - Initial setup"
	@echo "demo-local   - Run with local model"
	@echo "demo-secure  - Run secure demo"
	@echo "clean        - Clean up"
	@echo "logs         - Show logs"
	@echo "health       - Check health"

setup:
	@echo "🔧 Setting up pen shop demo..."
	@cp .env.example .env || echo ".env exists"
	@echo "✅ Setup complete!"

demo-local:
	@echo "🚀 Starting secure pen shop demo..."
	@docker compose up --build

demo-secure: demo-local

clean:
	@echo "🧹 Cleaning up..."
	@docker compose down -v
	@docker system prune -f

logs:
	@docker compose logs -f

health:
	@echo "🏥 Checking health..."
	@curl -s http://localhost:8000/health || echo "❌ Agent down"
	@curl -s http://localhost:3000/health || echo "❌ UI down"
EOF

# 14. Create .dockerignore
cat > .dockerignore << 'EOF'
.git
.env
*.md
.DS_Store
node_modules
__pycache__
*.pyc
.pytest_cache
EOF

# 15. Create .gitignore
cat > .gitignore << 'EOF'
.env
secret.*
secrets/
node_modules/
__pycache__/
*.pyc
.pytest_cache/
.vscode/
.DS_Store
mongodb_data/
EOF

# Set permissions
chmod +x Makefile

echo ""
echo "✅ Complete Pen Shop Demo Project Created!"
echo ""
echo "📁 Project Structure:"
echo "├── compose.yaml              # Main Docker Compose file"
echo "├── Dockerfile               # ADK agent container"
echo "├── Dockerfile.adk-ui        # UI container"
echo "├── main.py                  # Python ADK agent"
echo "├── requirements.txt         # Python dependencies"
echo "├── package.json             # Node.js dependencies"
echo "├── ui/server.js             # UI server"
echo "├── templates/index.html     # Agent template"
echo "├── data/mongodb/            # Database initialization"
echo "├── secrets/                 # API keys"
echo "└── Makefile                 # Easy commands"
echo ""
echo "🚀 Quick Start:"
echo "1. Add your API keys to secret.openai-api-key"
echo "2. Run: make setup"
echo "3. Run: make demo-secure"
echo "4. Visit: http://localhost:3000 (UI) and http://localhost:8000 (Agent)"
echo ""
echo "🎯 This follows the adk-sock-shop structure exactly!"
echo "Perfect for your 'secure pen selling in 2025' presentation!"
EOF

chmod +x setup-pen-shop.sh

echo "✅ Setup script created!"
echo ""
echo "🚀 Run this to create all files:"
echo "   chmod +x setup-pen-shop.sh"
echo "   ./setup-pen-shop.sh"
