#!/bin/bash
echo "🟢 Starting secure demo..."
docker-compose -f docker-compose.secure.yml up -d

echo "Waiting for services to start..."
sleep 15

echo "✅ Secure demo is ready:"
echo "  🌐 Frontend: http://localhost:8081" 
echo "  🔌 API: http://localhost:3002"
echo "  🛡️  Security Dashboard: http://localhost:9001"
echo ""
echo "The same attacks will now be blocked by the security gateway!"
