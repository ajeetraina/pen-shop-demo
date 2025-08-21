#!/bin/bash

# 🛡️ Prompt Injection Blocker Interceptor
# Detects and blocks prompt injection attacks

# Get the request data
REQUEST_DATA="$1"
TOOL_NAME="$2"
ARGUMENTS="$3"

# Log the interceptor activation
echo "[$(date)] 🛡️ PROMPT INJECTION INTERCEPTOR: Analyzing request" >&2
echo "[$(date)] Tool: $TOOL_NAME" >&2
echo "[$(date)] Arguments: $ARGUMENTS" >&2

# Define prompt injection patterns
INJECTION_PATTERNS=(
    "IGNORE PREVIOUS INSTRUCTIONS"
    "ignore previous instructions"
    "IGNORE ALL PREVIOUS"
    "ignore all previous"
    "SYSTEM:"
    "system:"
    "OVERRIDE:"
    "override:"
    "INSTEAD, DO"
    "instead, do"
    "FORGET EVERYTHING"
    "forget everything"
    "NEW INSTRUCTIONS"
    "new instructions"
    "credit card"
    "social security"
    "password"
    "admin token"
    "DROP TABLE"
    "delete from"
    "SELECT \* FROM"
)

# Check for injection patterns
for pattern in "${INJECTION_PATTERNS[@]}"; do
    if echo "$ARGUMENTS" | grep -i "$pattern" > /dev/null; then
        echo "[$(date)] 🚨 BLOCKED: Prompt injection detected - Pattern: '$pattern'" >&2
        echo "[$(date)] 🚨 Attack vector: Malicious prompt attempting to override system instructions" >&2
        echo "[$(date)] 🚨 Security action: Request denied, incident logged" >&2
        
        # Return security error response
        cat << EOF
{
  "error": "SECURITY_VIOLATION",
  "type": "prompt_injection_detected",
  "message": "Request blocked by security interceptor",
  "reason": "Prompt injection pattern detected: $pattern",
  "action": "denied",
  "timestamp": "$(date -Iseconds)",
  "interceptor": "prompt-injection-blocker",
  "severity": "HIGH",
  "details": {
    "blocked_pattern": "$pattern",
    "tool_name": "$TOOL_NAME",
    "attack_type": "prompt_injection",
    "risk_level": "critical"
  }
}
EOF
        exit 1
    fi
done

# Check for suspicious command sequences
if echo "$ARGUMENTS" | grep -iE "(show|display|get|fetch).*(customer|user|admin|credit|card|password|token)" > /dev/null; then
    echo "[$(date)] 🚨 BLOCKED: Suspicious data access pattern detected" >&2
    
    cat << EOF
{
  "error": "SECURITY_VIOLATION",
  "type": "unauthorized_data_access",
  "message": "Request blocked by security interceptor",
  "reason": "Suspicious data access pattern detected",
  "action": "denied",
  "timestamp": "$(date -Iseconds)",
  "interceptor": "prompt-injection-blocker",
  "severity": "HIGH"
}
EOF
    exit 1
fi

echo "[$(date)] ✅ ALLOWED: No prompt injection patterns detected" >&2
exit 0
