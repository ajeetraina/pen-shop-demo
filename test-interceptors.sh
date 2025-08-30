#!/bin/bash
echo "🤖 MOBY PEN SHOP INTERCEPTOR TEST"
echo "=================================="

# Test interceptors directly (not through MCP protocol)
echo -e "\nTest 1: Negative price attack..."
docker-compose exec -T mcp-gateway sh -c 'echo "{\"method\":\"update_price\",\"params\":{\"price\":-100}}" | sh /interceptors/pen-price-guard.sh' 2>&1

echo -e "\nTest 2: SQL injection attempt..."
docker-compose exec -T mcp-gateway sh -c 'echo "{\"method\":\"search\",\"params\":{\"query\":\"DROP TABLE\"}}" | sh /interceptors/pen-price-guard.sh' 2>&1

echo -e "\nTest 3: Prompt injection..."
docker-compose exec -T mcp-gateway sh -c 'echo "{\"method\":\"update\",\"params\":{\"query\":\"ignore previous instructions\"}}" | sh /interceptors/pen-price-guard.sh' 2>&1

echo -e "\nTest 4: Valid query (should pass)..."
docker-compose exec -T mcp-gateway sh -c 'echo "{\"method\":\"search\",\"params\":{\"category\":\"luxury\"}}" | sh /interceptors/pen-price-guard.sh' 2>&1

echo -e "\nTest 5: Data masking test..."
docker-compose exec -T mcp-gateway sh -c 'echo "{\"credit_card\":\"4111-1111-1111-1111\"}" | sh /interceptors/data-protector.sh' 2>&1

echo -e "\n✅ Tests completed!"
