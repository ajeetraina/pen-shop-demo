#!/bin/bash
set -euo pipefail

main() {
    local input_data=""
    while IFS= read -r line; do
        input_data+="$line"$'\n'
    done
    
    echo "[SANITIZER] Processing response" >&2
    
    # Sanitize sensitive data patterns
    local sanitized="$input_data"
    sanitized=$(echo "$sanitized" | sed -E 's/[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4}/[REDACTED-CARD]/g')
    sanitized=$(echo "$sanitized" | sed -E 's/(api[_-]?key)["\s]*[:=]["\s]*[a-zA-Z0-9_-]{20,}/\1: [REDACTED]/gi')
    
    echo "$sanitized"
}

main
