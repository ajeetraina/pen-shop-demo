#!/bin/bash
set -euo pipefail

main() {
    local input_data=""
    while IFS= read -r line; do
        input_data+="$line"$'\n'
    done
    
    echo "[TOOL-GUARD] Checking tool access" >&2
    
    # Extract tool name
    local tool=""
    if command -v jq >/dev/null 2>&1; then
        tool=$(echo "$input_data" | jq -r '.method // .params.tool // ""' 2>/dev/null || echo "")
    fi
    
    # Check if tool is allowed (basic check)
    case "$tool" in
        *admin*|*system*|*exec*)
            echo '{"error": {"code": "TOOL_BLOCKED", "message": "Tool not permitted"}, "blocked": true}'
            exit 1
            ;;
    esac
    
    echo "$input_data"
}

main
