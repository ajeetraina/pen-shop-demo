# 🖊️ Luxury Pen Shop Platform

A complete e-commerce platform for luxury writing instruments with AI shopping assistant.

## Architecture

- **Custom Frontend** (Port 9090) - React-based pen shop UI
- **Catalogue Service** (Port 8081) - Node.js API serving pen products
- **AI Assistant UI** (Port 3000) - React chat interface
- **ADK Backend** (Port 8000) - Go service with Google ADK
- **MySQL Database** - Pen product catalogue
- **MongoDB** - Customer reviews and AI conversation logs
- **MCP Gateway** - Tool integration for AI agent

## Quick Start

1. **Prerequisites:**
   - Docker & Docker Compose
   - 8GB+ RAM (for AI models)

2. **Setup:**
   ```bash
   # Add your OpenAI API key
   echo "your-openai-api-key" > secret.openai-api-key
   
   # Start the platform
   ./start.sh
   ```

3. **Access:**
   - **Main Store**: http://localhost:9090
   - **AI Assistant**: http://localhost:3000

## Troubleshooting

### Nested Directory Issue
If you see nested `pen-shop-demo/pen-shop-demo/pen-shop-demo` directories:

```bash
# Use the cleanup script
./cleanup-nested-dirs.sh
```

Or manually navigate to the correct directory:
```bash
# Find the directory with actual files
find . -name "compose.yaml" -type f

# Navigate to that directory
cd path/to/actual/pen-shop-demo
```

### Build Issues
If you get errors about missing `package-lock.json` or `go.sum`:

```bash
# Run the fix script
./fix-build-issues.sh

# Then try building again
docker compose up --build
```

### Common Errors & Solutions

**Missing package-lock.json:**
```bash
cd frontend && npm install --package-lock-only
cd ../catalogue-service && npm install --package-lock-only  
cd ../adk-ui && npm install --package-lock-only
```

**Missing go.sum:**
```bash
cd adk-backend && go mod tidy && go mod download
```

**Port conflicts:**
```bash
# Stop any services using these ports
docker compose down
# Check what's using the ports
lsof -i :9090,3000,8081,8000
```

### Alternative Build Approach

If builds still fail, try building services individually:

```bash
# Build frontend
docker build -t pen-frontend ./frontend

# Build catalogue
docker build -t pen-catalogue ./catalogue-service

# Build ADK backend  
docker build -t pen-adk-backend ./adk-backend

# Build ADK UI
docker build -t pen-adk-ui ./adk-ui

# Then start with pre-built images
docker compose up
```

## Features

- 🏪 Complete pen e-commerce store
- 🤖 AI shopping assistant with product knowledge
- 📦 Real-time inventory management
- 💬 Customer reviews and ratings
- 🔍 Advanced product search and filtering
- 🛒 Shopping cart and checkout (coming soon)

## Pen Brands Available

- **Montblanc** - Luxury fountain pens and writing instruments
- **Parker** - Classic and contemporary pen designs
- **Waterman** - Elegant fountain pens and rollerballs
- **Cross** - American-made quality writing instruments
- **Pilot** - Japanese precision and innovation

## Development

Each service can be developed independently:

```bash
# Frontend development
cd frontend && npm start

# Catalogue service development  
cd catalogue-service && npm run dev

# AI UI development
cd adk-ui && npm start
```

## Configuration

- **MySQL**: Port 3306, database `pendb`
- **MongoDB**: Port 27017, database `penstore`
- **Environment variables**: See compose.yaml

## File Structure

```
pen-shop-demo/
├── frontend/              # React e-commerce store
├── catalogue-service/     # Node.js product API
├── adk-backend/          # Go ADK service
├── adk-ui/               # React AI assistant
├── data/                 # Database initialization
├── compose.yaml          # Docker Compose config
├── start.sh              # Main startup script
├── fix-build-issues.sh   # Build troubleshooting
└── README.md             # This file
```

Enjoy your luxury pen shopping experience! 🖊️✨
