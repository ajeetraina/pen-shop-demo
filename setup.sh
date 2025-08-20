#!/bin/bash

echo "🖋️ Setting up Premium Pen Emporium Demo..."

# Create compose.yaml
cat > compose.yaml << 'EOF'
services:
  # ADK Pen Shop Agent
  adk:
    build: .
    ports:
      - "8080:8080"
    environment:
      # Model configuration
      - OPENAI_BASE_URL=http://models:8000/v1
      - OPENAI_MODEL_NAME=openai/qwen3
      - OPENAI_API_KEY=not-needed
      
      # MCP Gateway configuration  
      - MCP_GATEWAY_URL=http://mcp-gateway:8811/sse
      
      # Pen shop specific config
      - SHOP_NAME=Premium Pen Emporium
      - SHOP_DESCRIPTION=Luxury writing instruments and fountain pens
      - INVENTORY_DB=pen_inventory
      
    depends_on:
      - mcp-gateway
      - models
    models:
      qwen3:
        endpoint_var: OPENAI_BASE_URL
        model_var: OPENAI_MODEL_NAME

  # MCP Gateway for secure tool access
  mcp-gateway:
    image: docker/mcp-gateway:latest
    command: --transport=sse --servers=brave-search,mongodb,pen-catalog
    ports:
      - "8811:8811"
    use_api_socket: true
    environment:
      - BRAVE_API_KEY_FILE=/run/secrets/brave-api-key
      - MONGODB_URI=mongodb://mongodb:27017/pen_shop
    secrets:
      - brave-api-key
    depends_on:
      - mongodb

  # MongoDB for pen inventory
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - pen_data:/data/db
      - ./init-pen-data.js:/docker-entrypoint-initdb.d/init-pen-data.js:ro
    environment:
      - MONGO_INITDB_DATABASE=pen_shop

# Model configuration
models:
  qwen3:
    model: ai/qwen3:4b
    context_size: 10000
    gpu_acceleration: true

# Volumes for persistent data
volumes:
  pen_data:

# Secrets management
secrets:
  brave-api-key:
    file: ./secrets/brave-api-key.txt
EOF

# Create other files...
echo "✅ Created compose.yaml"

# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose the port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Run the application
CMD ["python", "app.py"]
EOF

echo "✅ Created Dockerfile"

# Create requirements.txt
cat > requirements.txt << 'EOF'
flask==3.0.0
flask-cors==4.0.0
google-adk==0.8.0
openai==1.50.0
pymongo==4.6.1
requests==2.31.0
pydantic==2.5.0
gunicorn==21.2.0
python-dotenv==1.0.0
mcp-client==0.7.0
EOF

echo "✅ Created requirements.txt"

# Create secrets directory and dummy files
mkdir -p secrets
echo "dummy-brave-search-key" > secrets/brave-api-key.txt
echo "sk-dummy-openai-key" > secrets/openai-api-key.txt

echo "✅ Created secrets directory"

echo ""
echo "🎯 Setup complete! Now run:"
echo "   git add ."
echo "   git commit -m 'Add pen shop demo files'"
echo "   git push origin main"
echo ""
echo "To test locally:"
echo "   make setup"
echo "   make demo-local"
