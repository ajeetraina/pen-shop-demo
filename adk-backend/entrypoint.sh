#!/bin/sh

if [ -f "/run/secrets/openai-api-key" ]; then
    export OPENAI_API_KEY=$(cat /run/secrets/openai-api-key)
    echo "Using OpenAI API key from secrets"
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo "No OpenAI API key found, configuring for Docker Model Runner"
    
    if [ -n "$MODEL_RUNNER_URL" ]; then
        export OPENAI_BASE_URL="$MODEL_RUNNER_URL"
    fi
    
    if [ -n "$MODEL_RUNNER_MODEL" ]; then
        export OPENAI_MODEL_NAME="openai/$MODEL_RUNNER_MODEL"
    fi
fi

echo "Pen Shop ADK Configuration:"
echo "  CATALOGUE_URL: $CATALOGUE_URL"
echo "  MCPGATEWAY_ENDPOINT: $MCPGATEWAY_ENDPOINT"
echo "  MONGODB_URI: $MONGODB_URI"

exec ./pen-shop-adk
