#!/bin/bash

echo "🔧 Fixing Pen Shop Frontend (port 9090)"
echo "========================================"

# Stop the broken frontend service
echo "1. Stopping broken pen-front-end service..."
docker compose stop pen-front-end

# Remove the broken container
echo "2. Removing broken container..."
docker compose rm -f pen-front-end

# Create backup of compose.yaml
echo "3. Creating backup of compose.yaml..."
cp compose.yaml compose.yaml.backup

# Fix the compose.yaml file by removing read_only: true from pen-front-end
echo "4. Fixing compose.yaml (removing read_only: true)..."
sed -i.bak '/pen-front-end:/,/^  [^ ]/ {
  /read_only: true/d
}' compose.yaml

# Alternative fix with tmpfs (commented out)
# You can use this instead if you want to keep read_only: true
cat > temp_fix.yaml << 'EOF'
# If you prefer to keep read_only: true, use this version instead:
# Just replace the pen-front-end service with:
#
# pen-front-end:
#   image: nginx:alpine
#   hostname: pen-front-end
#   ports:
#     - 9090:80
#   volumes:
#     - ./web-interface/index.html:/usr/share/nginx/html/index.html:ro
#   restart: always
#   cap_drop:
#     - all
#   read_only: true
#   tmpfs:
#     - /var/cache/nginx
#     - /var/run
#     - /tmp
EOF

# Start the service again
echo "5. Starting pen-front-end service..."
docker compose up -d pen-front-end

# Wait a moment for startup
echo "6. Waiting for service to start..."
sleep 5

# Check if it's working
echo "7. Testing the frontend..."
if curl -f -s http://localhost:9090 > /dev/null; then
    echo "✅ SUCCESS! Frontend is working on http://localhost:9090"
    echo ""
    echo "🖋️ Your Pen Shop UI is now available at:"
    echo "   http://localhost:9090"
    echo ""
    echo "📋 You can also test:"
    echo "   ADK UI: http://localhost:3000"
    echo "   API: http://localhost:8081/api/pens"
    echo ""
    echo "🎯 Ready for your security demo!"
else
    echo "❌ Still having issues. Let's check the logs:"
    docker compose logs pen-front-end --tail=10
    
    echo ""
    echo "🔍 Debug commands:"
    echo "   docker compose logs pen-front-end"
    echo "   docker compose ps"
    echo "   curl http://localhost:9090"
fi

# Show running services
echo ""
echo "8. Current service status:"
docker compose ps

echo ""
echo "✅ Fix script completed!"
echo "📝 Backup saved as: compose.yaml.backup"
