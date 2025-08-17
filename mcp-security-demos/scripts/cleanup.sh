#!/bin/bash
echo "🧹 Cleaning up all demo resources..."

docker-compose -f docker-compose.vulnerable.yml down -v
docker-compose -f docker-compose.secure.yml down -v

echo "🗑️  Removing unused Docker resources..."
docker system prune -f

echo "✅ Cleanup complete!"
