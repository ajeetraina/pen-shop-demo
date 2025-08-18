# 🖋️ Pen Shop Demo

A demo e-commerce application for premium writing instruments.

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
