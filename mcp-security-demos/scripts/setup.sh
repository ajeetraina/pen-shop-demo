#!/bin/bash
echo "🚀 Setting up MCP Security Demo..."

# Check if .env exists
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  Please edit .env file with your API keys before running demos"
    echo "   You need to add your OPENAI_API_KEY"
fi

# Build all images
echo "🏗️  Building Docker images..."
docker-compose -f docker-compose.vulnerable.yml build
docker-compose -f docker-compose.secure.yml build

echo "✅ Setup complete!"
echo "Run 'make demo-vulnerable' or 'make demo-secure' to start demos"
