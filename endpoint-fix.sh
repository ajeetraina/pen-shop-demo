#!/bin/bash

echo "🔧 Fixing frontend API endpoints..."

# Update the index.html to use correct endpoints
sed -i.bak 's|/catalogue|/api/pens|g' index.html

echo "✅ Updated frontend to use /api/pens endpoint"

# Test the correct endpoints
echo "🧪 Testing correct endpoints..."
curl http://localhost:9092/api/pens
echo ""
curl http://localhost:9092/health
