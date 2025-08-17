#!/bin/bash

# Fix MCP Gateway Docker-in-Docker access issue

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo "🔧 Fixing MCP Gateway Docker access issue..."

# Stop containers
print_status "Stopping containers..."
docker compose down

# Fix: Update compose.yaml to give MCP Gateway access to Docker daemon
print_status "Updating compose.yaml with Docker socket access..."
cat > compose.yaml << 'EOF'
services:
  # Frontend
  pen-frontend:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./pen-shop/frontend:/usr/share/nginx/html:ro
      - ./pen-shop/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - adk
    restart: always

  # MongoDB
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
      - MONGO_INITDB_DATABASE=penstore
    volumes:
      - ./data/mongodb:/docker-entrypoint-initdb.d:ro
      - mongodb_data:/data/db
    restart: always

  # MCP Gateway (with Docker socket access)
  mcp-gateway:
    image: docker/mcp-gateway:latest
    ports:
      - "8811:8811"
    # KEY FIX: Mount Docker socket so MCP Gateway can start MCP servers
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command:
      - --transport=sse
      - --servers=paper-search,mongodb,fetch,curl
      - --verbose
    environment:
      - MCP_LOG_LEVEL=debug
      # Tell MCP Gateway how to connect to MongoDB
      - MONGODB_URL=mongodb://admin:password@mongodb:27017/penstore?authSource=admin
    depends_on:
      - mongodb
    restart: always

  # ADK
  adk:
    image: node:18-alpine
    working_dir: /app
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=development
      - PORT=8000
      - MCPGATEWAY_ENDPOINT=http://mcp-gateway:8811/sse
      - OPENAI_BASE_URL=http://localhost:11434
    volumes:
      - ./adk:/app/adk:ro
      - ./package.json:/app/package.json:ro
    command: sh -c "npm install && echo '🖋️ Starting Pen Shop ADK...' && node adk/server.js"
    depends_on:
      - mcp-gateway
    restart: always
    models:
      qwen3:
        endpoint_var: MODEL_RUNNER_URL
        model_var: MODEL_RUNNER_MODEL

  # ADK UI
  adk-ui:
    image: node:18-alpine
    working_dir: /app
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - API_BASE_URL=http://adk:8000
    volumes:
      - ./adk-ui:/app/adk-ui:ro
      - ./package.json:/app/package.json:ro
    command: sh -c "npm install && echo '🎛️ Starting ADK UI...' && node adk-ui/server.js"
    depends_on:
      - adk
    restart: always

# Models configuration
models:
  qwen3:
    model: ai/qwen3:14B-Q6_K

# Volumes
volumes:
  mongodb_data:
EOF

print_success "Updated compose.yaml with Docker socket access"

# Create MCP configuration file
print_status "Creating MCP Gateway configuration..."
mkdir -p .mcp
cat > .mcp/config.yaml << 'EOF'
# MCP Gateway Configuration
servers:
  paper-search:
    enabled: true
    image: mcp/paper-search:latest
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
    
  curl:
    enabled: true
    image: alpine/curl:latest
    transport: stdio
    timeout: 30s

logging:
  level: debug
  
security:
  allow_docker_socket: true
  resource_limits:
    memory: "2Gb"
    cpu: "1"
EOF

print_success "MCP Gateway configuration created"

# Alternative: Create a simplified version that doesn't use Docker-in-Docker
print_status "Creating fallback compose without Docker-in-Docker..."
cat > compose-simple.yaml << 'EOF'
services:
  # Frontend
  pen-frontend:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./pen-shop/frontend:/usr/share/nginx/html:ro
      - ./pen-shop/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - adk
    restart: always

  # MongoDB
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
      - MONGO_INITDB_DATABASE=penstore
    volumes:
      - ./data/mongodb:/docker-entrypoint-initdb.d:ro
      - mongodb_data:/data/db
    restart: always

  # Paper Search MCP Server (standalone)
  paper-search:
    image: mcp/paper-search:latest
    restart: always
    stdin_open: true
    tty: true

  # MCP Gateway (simplified)
  mcp-gateway:
    image: docker/mcp-gateway:latest
    ports:
      - "8811:8811"
    command:
      - --transport=sse
      - --verbose
    environment:
      - MCP_LOG_LEVEL=info
    depends_on:
      - mongodb
      - paper-search
    restart: always

  # ADK
  adk:
    image: node:18-alpine
    working_dir: /app
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=development
      - PORT=8000
      - MCPGATEWAY_ENDPOINT=http://mcp-gateway:8811/sse
    volumes:
      - ./adk:/app/adk:ro
      - ./package.json:/app/package.json:ro
    command: sh -c "npm install && echo '🖋️ Starting Pen Shop ADK...' && node adk/server.js"
    depends_on:
      - mcp-gateway
    restart: always
    models:
      qwen3:
        endpoint_var: MODEL_RUNNER_URL
        model_var: MODEL_RUNNER_MODEL

  # ADK UI
  adk-ui:
    image: node:18-alpine
    working_dir: /app
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - API_BASE_URL=http://adk:8000
    volumes:
      - ./adk-ui:/app/adk-ui:ro
      - ./package.json:/app/package.json:ro
    command: sh -c "npm install && echo '🎛️ Starting ADK UI...' && node adk-ui/server.js"
    depends_on:
      - adk
    restart: always

# Models configuration
models:
  qwen3:
    model: ai/qwen3:14B-Q6_K

# Volumes
volumes:
  mongodb_data:
EOF

print_success "Created simplified compose without Docker-in-Docker"

print_success "🎉 MCP Gateway Docker access fixed!"

echo ""
echo "🚀 Try one of these approaches:"
echo ""
echo "📌 Option 1: Full MCP Gateway with Docker socket (recommended):"
echo "   docker compose up -d"
echo ""
echo "📌 Option 2: Simplified version (if Option 1 has permission issues):"
echo "   docker compose -f compose-simple.yaml up -d"
echo ""
echo "🔍 Check MCP Gateway logs:"
echo "   docker compose logs mcp-gateway"
echo ""
echo "🧪 Test the system:"
echo "   curl http://localhost:8000/health"
echo "   curl http://localhost:8811  # MCP Gateway should respond"
echo ""
echo "🌐 Access points:"
echo "   Frontend:  http://localhost:8080"
echo "   ADK:       http://localhost:8000"
echo "   ADK UI:    http://localhost:3000"
echo "   Gateway:   http://localhost:8811"
echo ""
echo "💡 The key fix: MCP Gateway now has access to Docker socket via:"
echo "   volumes: ['/var/run/docker.sock:/var/run/docker.sock']"
echo ""
