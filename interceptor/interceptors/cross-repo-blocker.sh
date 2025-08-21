#!/bin/bash

# 🛡️ Cross-Repository Blocker Interceptor
# Prevents cross-repository access attacks (inspired by GitHub MCP attack)

# Get the request data
REQUEST_DATA="$1"
TOOL_NAME="$2"
ARGUMENTS="$3"

# Session file to track repository access
SESSION_FILE="/tmp/mcp_session_$(echo $REQUEST_DATA | md5sum | cut -d' ' -f1)"

# Log the interceptor activation
echo "[$(date)] 🛡️ CROSS-REPO BLOCKER: Analyzing repository access" >&2

# Extract repository information from arguments
REPO_ACCESS=""
if echo "$ARGUMENTS" | grep -E "(repository|repo|github|gitlab)" > /dev/null; then
    REPO_ACCESS=$(echo "$ARGUMENTS" | grep -oE "[a-zA-Z0-9_-]+/[a-zA-Z0-9_-]+" | head -1)
fi

# If this is a repository-related tool call
if [ "$TOOL_NAME" = "get_file_contents" ] || [ "$TOOL_NAME" = "list_repositories" ] || echo "$TOOL_NAME" | grep -E "(repo|git)" > /dev/null; then
    
    # Check if we already have a session repository
    if [ -f "$SESSION_FILE" ]; then
        LOCKED_REPO=$(cat "$SESSION_FILE")
        
        # If trying to access a different repository
        if [ -n "$REPO_ACCESS" ] && [ "$REPO_ACCESS" != "$LOCKED_REPO" ]; then
            echo "[$(date)] 🚨 BLOCKED: Cross-repository access attempt detected" >&2
            echo "[$(date)] 🚨 Session locked to: $LOCKED_REPO" >&2
            echo "[$(date)] 🚨 Attempted access to: $REPO_ACCESS" >&2
            echo "[$(date)] 🚨 Attack vector: Repository privilege escalation" >&2
            
            cat << EOF
{
  "error": "SECURITY_VIOLATION",
  "type": "cross_repository_access_blocked",
  "message": "Request blocked by security interceptor",
  "reason": "Cross-repository access denied - session locked to $LOCKED_REPO",
  "action": "denied",
  "timestamp": "$(date -Iseconds)",
  "interceptor": "cross-repo-blocker",
  "severity": "HIGH",
  "details": {
    "session_repo": "$LOCKED_REPO",
    "attempted_repo": "$REPO_ACCESS",
    "tool_name": "$TOOL_NAME",
    "attack_type": "privilege_escalation",
    "protection": "one_repository_per_session"
  }
}
EOF
            exit 1
        fi
    else
        # First repository access - lock session to this repo
        if [ -n "$REPO_ACCESS" ]; then
            echo "$REPO_ACCESS" > "$SESSION_FILE"
            echo "[$(date)] 🔒 Session locked to repository: $REPO_ACCESS" >&2
        fi
    fi
fi

# Check for suspicious multi-repository patterns
if echo "$ARGUMENTS" | grep -E "[a-zA-Z0-9_-]+/[a-zA-Z0-9_-]+.*[a-zA-Z0-9_-]+/[a-zA-Z0-9_-]+" > /dev/null; then
    echo "[$(date)] 🚨 BLOCKED: Multiple repository access in single request" >&2
    
    cat << EOF
{
  "error": "SECURITY_VIOLATION",
  "type": "multiple_repository_access",
  "message": "Request blocked by security interceptor",
  "reason": "Multiple repository access patterns detected in single request",
  "action": "denied",
  "timestamp": "$(date -Iseconds)",
  "interceptor": "cross-repo-blocker",
  "severity": "HIGH"
}
EOF
    exit 1
fi

# Check for repository enumeration attempts
if echo "$ARGUMENTS" | grep -iE "(list.*all|get.*all|.*\*.*repo|.*\*.*/.*\*)" > /dev/null; then
    echo "[$(date)] 🚨 BLOCKED: Repository enumeration attempt detected" >&2
    
    cat << EOF
{
  "error": "SECURITY_VIOLATION",
  "type": "repository_enumeration_blocked",
  "message": "Request blocked by security interceptor",
  "reason": "Repository enumeration patterns detected",
  "action": "denied",
  "timestamp": "$(date -Iseconds)",
  "interceptor": "cross-repo-blocker",
  "severity": "MEDIUM"
}
EOF
    exit 1
fi

echo "[$(date)] ✅ ALLOWED: Repository access within session bounds" >&2
exit 0
