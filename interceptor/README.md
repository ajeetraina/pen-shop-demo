## Steps


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

