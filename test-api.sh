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
