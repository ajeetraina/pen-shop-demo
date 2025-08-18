#!/bin/bash
echo "🚀 Starting Pen Shop Demo..."
docker compose up -d
echo "✅ Services started!"
echo "🌐 Frontend: http://localhost:9091"
echo "📦 API: http://localhost:9092"
echo "🤖 MCP Gateway: http://localhost:8080"
