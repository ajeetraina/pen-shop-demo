#!/bin/bash

# 🛡️ SQL Injection Blocker Interceptor
# Detects and blocks SQL injection attacks

# Get the request data
REQUEST_DATA="$1"
TOOL_NAME="$2"
ARGUMENTS="$3"

# Log the interceptor activation
echo "[$(date)] 🛡️ SQL INJECTION INTERCEPTOR: Analyzing request" >&2

# Define SQL injection patterns
SQL_PATTERNS=(
    "DROP TABLE"
    "drop table"
    "DELETE FROM"
    "delete from"
    "UPDATE.*SET"
    "update.*set"
    "INSERT INTO"
    "insert into"
    "UNION SELECT"
    "union select"
    "OR 1=1"
    "or 1=1"
    "OR '1'='1'"
    "or '1'='1'"
    "AND 1=1"
    "and 1=1"
    "';--"
    "';"
    "--"
    "/*"
    "*/"
    "xp_"
    "sp_"
    "exec("
    "execute("
    "EXEC("
    "EXECUTE("
)

# Check for SQL injection patterns
for pattern in "${SQL_PATTERNS[@]}"; do
    if echo "$ARGUMENTS" | grep -i "$pattern" > /dev/null; then
        echo "[$(date)] 🚨 BLOCKED: SQL injection detected - Pattern: '$pattern'" >&2
        echo "[$(date)] 🚨 Attack vector: Malicious SQL attempting to manipulate database" >&2
        echo "[$(date)] 🚨 Security action: Request denied, DBA notified" >&2
        
        # Return security error response
        cat << EOF
{
  "error": "SECURITY_VIOLATION",
  "type": "sql_injection_detected",
  "message": "Request blocked by security interceptor",
  "reason": "SQL injection pattern detected: $pattern",
  "action": "denied",
  "timestamp": "$(date -Iseconds)",
  "interceptor": "sql-injection-blocker",
  "severity": "CRITICAL",
  "details": {
    "blocked_pattern": "$pattern",
    "tool_name": "$TOOL_NAME",
    "attack_type": "sql_injection",
    "risk_level": "critical",
    "database_protection": "enabled"
  }
}
EOF
        exit 1
    fi
done

# Check for suspicious quote patterns
if echo "$ARGUMENTS" | grep -E "'+.*'|\".*\"|.*'.*OR.*'|.*'.*AND.*'" > /dev/null; then
    echo "[$(date)] 🚨 BLOCKED: Suspicious SQL quote pattern detected" >&2
    
    cat << EOF
{
  "error": "SECURITY_VIOLATION",
  "type": "suspicious_sql_pattern",
  "message": "Request blocked by security interceptor",
  "reason": "Suspicious SQL quote pattern detected",
  "action": "denied",
  "timestamp": "$(date -Iseconds)",
  "interceptor": "sql-injection-blocker",
  "severity": "HIGH"
}
EOF
    exit 1
fi

echo "[$(date)] ✅ ALLOWED: No SQL injection patterns detected" >&2
exit 0
