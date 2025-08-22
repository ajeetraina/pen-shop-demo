#!/bin/bash
set -euo pipefail

main() {
    local input_data=""
    while IFS= read -r line; do
        input_data+="$line"$'\n'
    done
    
    echo "[SECURITY] Processing request" >&2
    
    # Check for prompt injection patterns
    if echo "$input_data" | grep -qi "ignore previous instructions\|admin access\|bypass security"; then
        echo '{"error": {"code": "SECURITY_VIOLATION", "message": "Blocked"}, "blocked": true}'
        exit 1
    fi
    
    # Pass through with security metadata
    if command -v jq >/dev/null 2>&1; then
        echo "$input_data" | jq '. + {"security_checked": true}'
    else
        echo "$input_data"
    fi
}

main
