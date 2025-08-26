# 🖊️ Pen Shop Sequential Multi-Agent System

## Architecture Overview

This implementation follows the **Docker ADK Sock Shop Sequential Agent pattern**, providing a robust, scalable multi-agent system for pen recommendations.

### Sequential Agent Pattern

```
Customer Query → Sequential Agent → [Research → Price → Reviews → Recommend] → Final Response
```

## Agents Overview

### 🤖 **Sequential Agent** (Main Orchestrator)
- **Role**: Coordinates workflow and manages sub-agents
- **Pattern**: Similar to "Supplier Intake Sequential Agent" in ADK Sock Shop
- **Responsibilities**: Query routing, context management, response synthesis

### 🔍 **Pen Research Agent** 
- **Role**: Gathers comprehensive product information
- **Pattern**: Similar to "Reddit Research" agent in ADK Sock Shop
- **Tools**: Product database, specifications lookup, feature analysis

### 💰 **Price Research Agent**
- **Role**: Analyzes pricing and budget options
- **Tools**: Price comparisons, deal finding, budget analysis

### ⭐ **Review Agent**
- **Role**: Processes customer feedback and reviews
- **Tools**: Review aggregation, sentiment analysis, rating synthesis

### 🎯 **Recommendation Agent**
- **Role**: Generates personalized recommendations
- **Pattern**: Similar to "Customer Review Agent" in ADK Sock Shop
- **Tools**: ML-powered suggestions, preference matching

## Quick Start

1. **Run the setup script:**
   ```bash
   chmod +x setup_multiagent.sh
   ./setup_multiagent.sh
   ```

2. **Add your API keys:**
   ```bash
   echo "your-openai-key" > secret.openai-api-key
   export BRAVE_API_KEY=your-brave-key
   ```

3. **Start the system:**
   ```bash
   docker compose -f compose-multiagent.yaml up --build
   ```

4. **Access the applications:**
   - Main Store: http://localhost:9090
   - AI Chat Interface: http://localhost:3000
   - Health Check: http://localhost:8000/api/health

## Example Interactions

### Simple Query
**Input**: "I need a fountain pen for daily writing"

**Sequential Processing**:
1. **Research Agent**: Finds fountain pens in catalog
2. **Price Agent**: Analyzes budget options
3. **Review Agent**: Checks customer feedback
4. **Recommend Agent**: Suggests Pilot Vanishing Point

### Complex Query
**Input**: "Compare Montblanc and Parker fountain pens under $200"

**Sequential Processing**:
1. **Research Agent**: Gathers Montblanc/Parker specs
2. **Price Agent**: Filters options under $200
3. **Review Agent**: Compares customer satisfaction
4. **Recommend Agent**: Provides detailed comparison

## Configuration

### Environment Variables

```bash
# Agent Configuration
AGENT_MODE=sequential
SEQUENTIAL_AGENT_ENABLED=true

# AI Configuration
OPENAI_API_KEY=your-key
OPENAI_BASE_URL=https://api.openai.com/v1
AI_DEFAULT_MODEL=openai/gpt-4

# MCP Gateway
MCPGATEWAY_ENDPOINT=http://mcp-gateway:8811/sse
BRAVE_API_KEY=your-brave-key

# Databases
MONGODB_URI=mongodb://admin:password@mongodb:27017/penstore
CATALOGUE_URL=http://pen-catalogue:8081
```

## Security Features

- **MCP Gateway**: Secures all external tool access
- **Rate Limiting**: Prevents API abuse
- **Input Sanitization**: Protects against injection attacks
- **Containerized Isolation**: Each service runs in isolation

## Monitoring

- **Health Checks**: All services include health endpoints
- **Logging**: Structured logging for debugging
- **Metrics**: Processing time and success rates tracked

## Development

### Adding New Agents

1. Create agent in `adk-backend/agents/`
2. Implement `models.Agent` interface
3. Register with Sequential Agent
4. Update workflow steps

### Testing

```bash
# Test health endpoint
curl http://localhost:8000/api/health

# Test chat endpoint
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "I need a fountain pen recommendation"}'
```

## Architecture Benefits

✅ **Proven Pattern**: Based on Docker's ADK Sock Shop example
✅ **Sequential Processing**: Each agent builds on previous results  
✅ **Security**: MCP Gateway provides secure tool access
✅ **Scalability**: Easy to add new agents and capabilities
✅ **Maintainability**: Clear separation of concerns
✅ **Observability**: Built-in logging and health checks

## Troubleshooting

### Common Issues

1. **Agents not responding**: Check MCP Gateway connectivity
2. **Slow responses**: Increase timeout values in workflow
3. **Missing recommendations**: Verify all required agents are registered
4. **Database errors**: Check MongoDB connection string

### Debug Mode

```bash
export DEBUG_AGENTS=true
export LOG_LEVEL=debug
```

## Next Steps

1. **Add more specialized agents** (Gift Agent, Maintenance Agent)
2. **Implement caching** for frequently asked questions
3. **Add A/B testing** for different recommendation strategies
4. **Integrate external APIs** for real-time pricing
5. **Add user preference learning** for personalization
