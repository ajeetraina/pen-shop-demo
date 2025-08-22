#!/bin/bash
set -euo pipefail

main() {
    local input_data=""
    while IFS= read -r line; do
        input_data+="$line"$'\n'
    done
    
    echo "[OUTPUT-FILTER] Filtering output" >&2
    
    # Check output size
    if [ ${#input_data} -gt 50000 ]; then
        echo '{"error": {"code": "OUTPUT_TOO_LARGE", "message": "Output too large"}, "filtered": true}'
        exit 1
    fi
    
    # Filter internal data
    local filtered="$input_data"
    filtered=$(echo "$filtered" | sed -E 's/"internal_id":[^,}]+/"internal_id":"[FILTERED]"/g')
    
    echo "$filtered"
}

main
