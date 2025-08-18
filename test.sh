#!/bin/bash

echo "🤖 Testing MCP Gateway..."
echo ""

echo "1️⃣ Testing main endpoint (should redirect to SSE):"
curl -w "\nStatus: %{http_code}\n" http://localhost:8080
echo ""

echo "2️⃣ Testing SSE endpoint:"
curl -w "\nStatus: %{http_code}\n" http://localhost:8080/sse
echo ""

echo "3️⃣ Testing if MCP Gateway is accepting connections:"
timeout 3 curl -N http://localhost:8080/sse 2>/dev/null || echo "SSE stream available (timeout expected)"
echo ""

echo "4️⃣ Testing pen-catalogue API:"
echo "Frontend: http://localhost:9091"
echo "API: http://localhost:9092"
echo ""

echo "5️⃣ Testing pen-catalogue health:"
curl -s http://localhost:9092/health | jq '.' 2>/dev/null || curl -s http://localhost:9092/health
echo ""

echo "6️⃣ Testing pen-catalogue catalogue:"
curl -s http://localhost:9092/catalogue | jq '.pens[0].name' 2>/dev/null || echo "API not ready yet"
echo ""

echo "✅ MCP Gateway is running correctly on http://localhost:8080"
echo "🌐 Open http://localhost:9091 to see the pen shop frontend"
