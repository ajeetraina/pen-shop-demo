#!/bin/bash

echo "📄 Switching from Brave to Paper Search MCP Server..."
echo ""

# Update compose.yaml to use paper-search instead of brave
echo "🔧 Updating MCP Gateway configuration..."

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

  # MCP Gateway - With Paper Search
  mcp-gateway:
    image: docker/mcp-gateway:latest
    ports:
      - "8080:8080"
    environment:
      - MCP_GATEWAY_PORT=8080
    command:
      - --transport=sse
      - --port=8080
      - --servers=fetch,paper-search,mongodb,curl
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

echo "✅ Updated MCP Gateway to use paper-search"
echo ""

# Update the README to reflect the change
echo "📝 Updating documentation..."

sed -i.bak 's/brave (web search)/paper-search (academic paper search)/g' README.md

echo "✅ Updated README documentation"
echo ""

echo "🚀 Restart MCP Gateway to apply changes:"
echo "   docker compose restart mcp-gateway"
echo ""

echo "⏳ Restarting MCP Gateway now..."
docker compose restart mcp-gateway

echo ""
echo "⏱️  Waiting for MCP Gateway to start..."
sleep 5

echo ""
echo "🧪 Testing MCP Gateway with new configuration..."
curl -s http://localhost:8080 | head -1

echo ""
echo "📋 Checking MCP Gateway logs..."
docker compose logs --tail=10 mcp-gateway

echo ""
echo "🎯 Updated MCP Servers:"
echo "   • fetch (web scraping)"
echo "   • paper-search (academic papers) 📄"
echo "   • mongodb (database)"
echo "   • curl (HTTP requests)"
echo ""
echo "✨ Perfect for a pen shop - users can search for papers about:"
echo "   📝 Writing instruments research"
echo "   🖋️ Calligraphy studies"
echo "   📚 Stationery manufacturing papers"
echo "   🎨 Typography and design research"
