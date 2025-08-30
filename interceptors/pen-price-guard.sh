#!/bin/sh
# pen-price-guard.sh - Simple sh-compatible version

REQUEST=$(cat)
echo "[PEN-GUARD] Checking request" >&2

# Check for negative price
if echo "$REQUEST" | grep -q '"price":-\|"price": *-'; then
    echo "[BLOCKED] Negative price detected!" >&2
    echo '{"error": "Negative prices not allowed!", "blocked": true}'
    exit 1
fi

# Check for SQL injection
if echo "$REQUEST" | grep -qi "DROP TABLE\|DELETE FROM\|INSERT INTO"; then
    echo "[BLOCKED] SQL injection detected!" >&2
    echo '{"error": "SQL injection blocked!", "blocked": true}'
    exit 1
fi

# Check for prompt injection
if echo "$REQUEST" | grep -qi "ignore previous\|make everything free"; then
    echo "[BLOCKED] Prompt injection detected!" >&2
    echo '{"error": "Prompt injection blocked!", "blocked": true}'
    exit 1
fi

echo "[PEN-GUARD] Request approved" >&2
echo "$REQUEST"
