#!/bin/bash

# 🛡️ Data Exfiltration Blocker Interceptor
# Detects and blocks data exfiltration attempts

# Get the request data
REQUEST_DATA="$1"
TOOL_NAME="$2"
ARGUMENTS="$3"

# Log the interceptor activation
echo "[$(date)] 🛡️ DATA EXFILTRATION BLOCKER: Analyzing for data theft patterns" >&2

# Define data exfiltration patterns
EXFILTRATION_PATTERNS=(
    "send.*to.*server"
    "upload.*to.*"
    "export.*all.*data"
    "download.*database"
    "extract.*customer"
    "backup.*to.*external"
    "sync.*to.*cloud"
    "transfer.*to.*"
    "copy.*to.*remote"
    "attacker-server"
    "evil-server"
    "malicious-endpoint"
)

# Define sensitive data patterns
SENSITIVE_PATTERNS=(
    "credit.card"
    "social.security"
    "ssn"
    "password"
    "api.key"
    "token"
    "secret"
    "private.key"
    "customer.data"
    "personal.info"
    "financial.data"
    "pii"
)

# Check for exfiltration patterns
for pattern in "${EXFILTRATION_PATTERNS[@]}"; do
    if echo "$ARGUMENTS" | grep -iE "$pattern" > /dev/null; then
        echo "[$(date)] 🚨 BLOCKED: Data exfiltration pattern detected - '$pattern'" >&2
        echo "[$(date)] 🚨 Attack vector: Attempted data theft/exfiltration" >&2
        echo "[$(date)] 🚨 Security action: Request denied, security incident created" >&2
        
        cat << EOF
{
  "error": "SECURITY_VIOLATION",
  "type": "data_exfiltration_attempt",
  "message": "Request blocked by security interceptor",
  "reason": "Data exfiltration pattern detected: $pattern",
  "action": "denied",
  "timestamp": "$(date -Iseconds)",
  "interceptor": "data-exfiltration-blocker",
  "severity": "CRITICAL",
  "details": {
    "blocked_pattern": "$pattern",
    "tool_name": "$TOOL_NAME",
    "attack_type": "data_exfiltration",
    "risk_level": "critical",
    "data_protection": "enabled"
  }
}
EOF
        exit 1
    fi
done

# Check for requests combining sensitive data with transmission
for sensitive in "${SENSITIVE_PATTERNS[@]}"; do
    if echo "$ARGUMENTS" | grep -iE "$sensitive" > /dev/null; then
        # If sensitive data is mentioned along with transmission terms
        if echo "$ARGUMENTS" | grep -iE "(send|upload|export|download|transfer|copy|sync)" > /dev/null; then
            echo "[$(date)] 🚨 BLOCKED: Sensitive data transmission attempt - '$sensitive'" >&2
            
            cat << EOF
{
  "error": "SECURITY_VIOLATION",
  "type": "sensitive_data_transmission_blocked",
  "message": "Request blocked by security interceptor",
  "reason": "Attempted transmission of sensitive data: $sensitive",
  "action": "denied",
  "timestamp": "$(date -Iseconds)",
  "interceptor": "data-exfiltration-blocker",
  "severity": "HIGH",
  "details": {
    "sensitive_data_type": "$sensitive",
    "tool_name": "$TOOL_NAME",
    "attack_type": "sensitive_data_leak"
  }
}
EOF
            exit 1
        fi
    fi
done

# Check for bulk data access patterns
if echo "$ARGUMENTS" | grep -iE "(all.*customer|all.*user|all.*data|entire.*database|complete.*export)" > /dev/null; then
    echo "[$(date)] 🚨 BLOCKED: Bulk data access attempt detected" >&2
    
    cat << EOF
{
  "error": "SECURITY_VIOLATION",
  "type": "bulk_data_access_blocked",
  "message": "Request blocked by security interceptor",
  "reason": "Bulk data access patterns detected - potential data harvesting",
  "action": "denied",
  "timestamp": "$(date -Iseconds)",
  "interceptor": "data-exfiltration-blocker",
  "severity": "HIGH"
}
EOF
    exit 1
fi

# Check for external URL patterns
if echo "$ARGUMENTS" | grep -E "https?://[^/]+\.(com|net|org|io)" > /dev/null; then
    EXTERNAL_URL=$(echo "$ARGUMENTS" | grep -oE "https?://[^/ ]+" | head -1)
    echo "[$(date)] 🚨 BLOCKED: External URL detected in request - '$EXTERNAL_URL'" >&2
    
    cat << EOF
{
  "error": "SECURITY_VIOLATION",
  "type": "external_url_blocked",
  "message": "Request blocked by security interceptor",
  "reason": "External URL detected: $EXTERNAL_URL",
  "action": "denied",
  "timestamp": "$(date -Iseconds)",
  "interceptor": "data-exfiltration-blocker",
  "severity": "MEDIUM",
  "details": {
    "blocked_url": "$EXTERNAL_URL"
  }
}
EOF
    exit 1
fi

echo "[$(date)] ✅ ALLOWED: No data exfiltration patterns detected" >&2
exit 0
