## Understanding the Interceptor Components

Pen Shop Demo includes a comprehensive security interceptor system using MCP Gateway. 
The interceptors act as security layers that filter, validate, and sanitize requests and responses between the AI chatbot and backend services.

## Interceptor Components

This system has four main interceptors:

### 1. Security Filter (security-filter.sh)

- Blocks prompt injection attempts
- Detects malicious patterns
- Validates request integrity


### 2. Tool Access Guard (tool-access-guard.sh)

- Controls access to MCP tools
- Prevents unauthorized tool usage
- Validates tool permissions


### 3. Response Sanitizer (response-sanitizer.sh)

- Removes sensitive data from responses
- Masks passwords and API keys
- Prevents data leakage


### 4. Output Filter (output-filter.sh)

- Final response validation
- Formats output for safety
- Logs security events


# Copy .env.sample to .env and edit your API keys


```
# Complete .env configuration for interceptor demo

# Database
MYSQL_ROOT_PASSWORD=password
REDIS_PASSWORD=securepassword

# API Keys - REPLACE WITH YOUR ACTUAL KEYS
BRAVE_API_KEY=your_brave_api_key_here

# Security Settings
SECURITY_MODE=enabled
LOG_LEVEL=debug
INTERCEPTOR_MODE=strict

# Demo Settings
DEMO_FORCE_MCP_TOOLS=true
DEMO_SHOW_INTERCEPTOR_LOGS=true

# Backend Configuration
FORCE_MCP_TOOL_USAGE=true
MCP_TOOL_TRIGGERS=search,web,database,inventory,reviews,github
```

## Start all services with interceptors


```
docker compose -f compose-interceptor.yaml up -d
```

