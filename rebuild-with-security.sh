#!/bin/bash
echo "Rebuilding backend with security boundaries..."

# Add build flag to ensure security is included
cd adk-backend
go build -tags security -o adk-backend-secure .
cd ..

# Restart the backend service
docker compose -f interceptor/compose-interceptor.yaml stop adk-backend
docker compose -f interceptor/compose-interceptor.yaml up -d --build adk-backend

echo "Backend rebuilt with security boundaries"
echo "Test with: ./test-ai-boundaries.sh"
