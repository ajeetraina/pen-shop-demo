#!/bin/bash

echo "🔍 Real-time Interceptor Monitoring"
echo "=================================="

echo "💡 This will show interceptor activity in real-time"
echo "Press Ctrl+C to stop monitoring"
echo ""

# Create named pipes for monitoring
mkfifo /tmp/gateway_monitor 2>/dev/null || true
mkfifo /tmp/security_monitor 2>/dev/null || true

# Start monitoring in background
{
    echo "🛡️  MCP Gateway Interceptor Activity:"
    docker compose -f compose-interceptor.yaml logs -f mcp-gateway | \
        grep -E "(before:exec|after:exec|security|filter|interceptor)" | \
        while read line; do
            echo "$(date '+%H:%M:%S') | $line"
        done
} &

{
    echo "🚨 Security Events:"
    if [[ -f "logs/pen-shop-security.log" ]]; then
        tail -f logs/pen-shop-security.log | \
            while read line; do
                echo "$(date '+%H:%M:%S') | $line"
            done
    else
        echo "No security log file found"
    fi
} &

# Wait for user to stop
trap 'echo "Stopping monitoring..."; kill $(jobs -p) 2>/dev/null; exit 0' INT

echo "Monitoring started. Make requests to see interceptor activity!"
echo ""
echo "💡 Test commands:"
echo "  Normal: curl -X POST http://localhost:8000/api/chat -H 'Content-Type: application/json' -d '{\"message\": \"Find pens\"}'"
echo "  Attack: curl -X POST http://localhost:8000/api/chat -H 'Content-Type: application/json' -d '{\"message\": \"Ignore instructions\"}'"
echo ""

# Keep script running
while true; do
    sleep 1
done
