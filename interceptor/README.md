## Steps


# Edit your API keys


```
cat > .env << 'EOF'
BRAVE_API_KEY=your_brave_api_key_here
MYSQL_ROOT_PASSWORD=password
REDIS_PASSWORD=securepassword
EOF
```

## Start all services with interceptors


```
docker compose -f compose-interceptor.yaml up -d
```

