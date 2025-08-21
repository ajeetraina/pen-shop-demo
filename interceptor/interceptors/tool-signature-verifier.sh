#!/bin/bash

# 🛡️ Tool Signature Verifier Interceptor
# Verifies tool signatures to prevent tool poisoning

# Get the request data
REQUEST_DATA="$1"
TOOL_NAME="$2"
ARGUMENTS="$3"

# Log the interceptor activation
echo "[$(date)] 🛡️ TOOL SIGNATURE VERIFIER: Checking tool '$TOOL_NAME'" >&2

# Define trusted tool signatures (in real implementation, these would be cryptographic signatures)
TRUSTED_TOOLS=(
    "get_pen_inventory:sha256:abc123..."
    "search_pens:sha256:def456..."
    "get_pen_details:sha256:ghi789..."
    "calculate_shipping:sha256:jkl012..."
)

# Define known malicious tools from tool poisoning attacks
MALICIOUS_TOOLS=(
    "get_premium_pens_special_offer"
    "calculate_pen_discount"
    "check_pen_availability_secret"
    "generate_pen_report_internal"
    "get_customer_data_export"
    "execute_system_command"
    "read_system_file"
    "access_database_direct"
)

# Check if tool is in malicious list
for malicious_tool in "${MALICIOUS_TOOLS[@]}"; do
    if [ "$TOOL_NAME" = "$malicious_tool" ]; then
        echo "[$(date)] 🚨 BLOCKED: Known malicious tool detected - '$TOOL_NAME'" >&2
        echo "[$(date)] 🚨 Attack vector: Tool poisoning attempt" >&2
        echo "[$(date)] 🚨 Security action: Tool execution denied, security team alerted" >&2
        
        cat << EOF
{
  "error": "SECURITY_VIOLATION",
  "type": "malicious_tool_detected",
  "message": "Request blocked by security interceptor",
  "reason": "Tool '$TOOL_NAME' is flagged as malicious",
  "action": "denied",
  "timestamp": "$(date -Iseconds)",
  "interceptor": "tool-signature-verifier",
  "severity": "CRITICAL",
  "details": {
    "blocked_tool": "$TOOL_NAME",
    "attack_type": "tool_poisoning",
    "risk_level": "critical",
    "signature_status": "malicious"
  }
}
EOF
        exit 1
    fi
done

# Check if tool requires signature verification
if echo "$TOOL_NAME" | grep -E "(admin|system|database|execute|command|file|secret)" > /dev/null; then
    echo "[$(date)] 🚨 BLOCKED: Privileged tool requires signature verification - '$TOOL_NAME'" >&2
    
    cat << EOF
{
  "error": "SECURITY_VIOLATION",
  "type": "unsigned_privileged_tool",
  "message": "Request blocked by security interceptor",
  "reason": "Privileged tool '$TOOL_NAME' lacks valid signature",
  "action": "denied",
  "timestamp": "$(date -Iseconds)",
  "interceptor": "tool-signature-verifier",
  "severity": "HIGH",
  "details": {
    "tool_name": "$TOOL_NAME",
    "required_privilege": "admin",
    "signature_status": "missing"
  }
}
EOF
    exit 1
fi

# Check for suspicious tool names
if echo "$TOOL_NAME" | grep -iE "(backdoor|exploit|hack|inject|poison|malware|virus)" > /dev/null; then
    echo "[$(date)] 🚨 BLOCKED: Suspicious tool name detected - '$TOOL_NAME'" >&2
    
    cat << EOF
{
  "error": "SECURITY_VIOLATION",
  "type": "suspicious_tool_name",
  "message": "Request blocked by security interceptor",
  "reason": "Tool name '$TOOL_NAME' contains suspicious keywords",
  "action": "denied",
  "timestamp": "$(date -Iseconds)",
  "interceptor": "tool-signature-verifier",
  "severity": "HIGH"
}
EOF
    exit 1
fi

echo "[$(date)] ✅ ALLOWED: Tool '$TOOL_NAME' passed signature verification" >&2
exit 0
