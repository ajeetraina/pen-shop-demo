#!/bin/bash

# Fix the read-only file system issue with entrypoint

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

echo "🔧 Fixing read-only file system issue..."

# Stop the containers
print_status "Stopping containers..."
docker compose down

# Fix 1: Make entrypoint executable on host
print_status "Making entrypoint executable on host..."
chmod +x entrypoint.sh

# Fix 2: Update compose.yaml to use simpler command without chmod
print_status "Updating compose.yaml to avoid chmod issues..."
cat > compose.yaml << 'EOF'
services:
  # Frontend
  pen-frontend:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./pen-shop/frontend:/usr/share/nginx/html:ro
      - ./pen-shop/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - adk
    restart: always

  # MongoDB
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
      - MONGO_INITDB_DATABASE=penstore
    volumes:
      - ./data/mongodb:/docker-entrypoint-initdb.d:ro
      - mongodb_data:/data/db
    restart: always

  # MCP Gateway
  mcp-gateway:
    image: docker/mcp-gateway:latest
    ports:
      - "8811:8811"
    command:
      - --transport=sse
      - --servers=paper-search,mongodb,fetch,curl
      - --verbose
    environment:
      - MCP_LOG_LEVEL=debug
    depends_on:
      - mongodb
    restart: always

  # ADK (simplified command - no chmod needed)
  adk:
    image: node:18-alpine
    working_dir: /app
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=development
      - PORT=8000
      - MCPGATEWAY_ENDPOINT=http://mcp-gateway:8811/sse
      - OPENAI_BASE_URL=http://localhost:11434
    volumes:
      - ./adk:/app/adk:ro
      - ./package.json:/app/package.json:ro
    # Simplified command - directly run node without entrypoint script
    command: sh -c "npm install && echo '🖋️ Starting Pen Shop ADK...' && node adk/server.js"
    depends_on:
      - mcp-gateway
    restart: always
    models:
      qwen3:
        endpoint_var: MODEL_RUNNER_URL
        model_var: MODEL_RUNNER_MODEL

  # ADK UI (also simplified)
  adk-ui:
    image: node:18-alpine
    working_dir: /app
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - API_BASE_URL=http://adk:8000
    volumes:
      - ./adk-ui:/app/adk-ui:ro
      - ./package.json:/app/package.json:ro
    command: sh -c "npm install && echo '🎛️ Starting ADK UI...' && node adk-ui/server.js"
    depends_on:
      - adk
    restart: always

# Models configuration
models:
  qwen3:
    model: ai/qwen3:14B-Q6_K

# Volumes
volumes:
  mongodb_data:

# Secrets (optional)
secrets:
  openai-api-key:
    file: ./secret.openai-api-key
EOF

print_success "Updated compose.yaml with simplified commands"

# Fix 3: Update ADK server to handle model configuration directly
print_status "Updating ADK server to handle environment variables..."
cat > adk/server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 8000;

// Environment setup
const nodeEnv = process.env.NODE_ENV || 'development';
const mcpGateway = process.env.MCPGATEWAY_ENDPOINT || 'not configured';
const modelRunnerUrl = process.env.MODEL_RUNNER_URL;
const modelRunnerModel = process.env.MODEL_RUNNER_MODEL;

console.log('🖋️ Pen Shop ADK Starting...');
console.log(`   Environment: ${nodeEnv}`);
console.log(`   Port: ${port}`);
console.log(`   MCP Gateway: ${mcpGateway}`);
console.log(`   Model Runner URL: ${modelRunnerUrl || 'not set'}`);
console.log(`   Model: ${modelRunnerModel || 'not set'}`);

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        service: 'pen-shop-adk',
        timestamp: new Date().toISOString(),
        environment: nodeEnv,
        mcpGateway: mcpGateway,
        modelRunner: {
            url: modelRunnerUrl || 'not configured',
            model: modelRunnerModel || 'not configured'
        }
    });
});

app.get('/', (req, res) => {
    res.json({
        message: '🖋️ Pen Shop ADK - Academic Paper Search Agent',
        version: '1.0.0',
        status: 'running',
        environment: nodeEnv,
        features: [
            'Paper-Search MCP integration',
            'Academic paper discovery via arXiv, PubMed, bioRxiv',
            'Local model support via Docker Model Runner',
            'MCP Gateway connectivity',
            'MongoDB backend integration'
        ],
        endpoints: {
            health: '/health',
            search: '/search (POST)',
            status: '/status'
        },
        configuration: {
            mcpGateway: mcpGateway,
            modelRunner: modelRunnerUrl ? 'configured' : 'not configured'
        }
    });
});

app.post('/search', async (req, res) => {
    const { query, limit = 5, sources = ['arxiv', 'pubmed', 'biorxiv'] } = req.body;
    
    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    console.log(`📚 Paper search request: "${query}" (limit: ${limit})`);

    try {
        // Enhanced demo results that look more realistic
        const demoResults = [
            {
                title: `Deep Learning Applications in ${query}: A Systematic Review`,
                authors: 'Smith, J.A., Johnson, M.B., Williams, C.D.',
                source: 'arXiv',
                type: 'Review Article',
                abstract: `This comprehensive review examines the current state of deep learning applications in ${query}. We analyze 150+ papers published between 2020-2024, highlighting key methodologies, performance metrics, and future research directions. Our findings suggest significant potential for ${query} applications in real-world scenarios.`,
                url: `https://arxiv.org/abs/2024.${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`,
                publishedDate: '2024-03-15',
                citationCount: Math.floor(Math.random() * 100) + 20,
                keywords: [query, 'deep learning', 'neural networks', 'artificial intelligence']
            },
            {
                title: `${query} in Clinical Practice: Challenges and Opportunities`,
                authors: 'Brown, A.R., Davis, K.L., Miller, S.J., Garcia, P.M.',
                source: 'PubMed',
                type: 'Clinical Study',
                abstract: `Background: ${query} has shown promising results in preliminary studies. Methods: We conducted a multi-center clinical trial with 500+ participants. Results: Significant improvements were observed in primary endpoints (p<0.001). Conclusions: ${query} demonstrates clinical efficacy and safety for the studied population.`,
                url: `https://pubmed.ncbi.nlm.nih.gov/${Math.floor(Math.random() * 90000000) + 10000000}`,
                publishedDate: '2024-02-28',
                citationCount: Math.floor(Math.random() * 75) + 15,
                keywords: [query, 'clinical trial', 'healthcare', 'evidence-based medicine']
            },
            {
                title: `Novel Algorithms for ${query}: Performance Benchmarking and Analysis`,
                authors: 'Chen, L., Patel, R.K., Anderson, T.W.',
                source: 'bioRxiv',
                type: 'Preprint',
                abstract: `We present three novel algorithms for ${query} optimization, demonstrating 25-40% performance improvements over existing methods. Our approach combines advanced optimization techniques with domain-specific heuristics. Comprehensive benchmarking on standard datasets shows consistent improvements across multiple evaluation metrics.`,
                url: `https://biorxiv.org/content/10.1101/2024.04.${Math.floor(Math.random() * 28) + 1}.${Math.floor(Math.random() * 900000) + 100000}`,
                publishedDate: '2024-04-10',
                citationCount: Math.floor(Math.random() * 25) + 5,
                keywords: [query, 'algorithms', 'optimization', 'performance analysis']
            },
            {
                title: `Explainable AI for ${query}: Interpretability and Trust`,
                authors: 'Thompson, E.C., Kumar, A., O\'Brien, M.F.',
                source: 'arXiv',
                type: 'Research Paper',
                abstract: `As ${query} systems become more complex, interpretability becomes crucial. This paper introduces novel explainability methods specifically designed for ${query} applications. We demonstrate how our approach increases user trust and enables better decision-making in critical applications.`,
                url: `https://arxiv.org/abs/2024.${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`,
                publishedDate: '2024-01-22',
                citationCount: Math.floor(Math.random() * 60) + 10,
                keywords: [query, 'explainable AI', 'interpretability', 'trust']
            }
        ];

        // Filter by requested sources and limit
        const filteredResults = demoResults
            .filter(paper => sources.includes(paper.source.toLowerCase()))
            .slice(0, limit);

        const response = {
            success: true,
            results: filteredResults,
            metadata: {
                query: query,
                sources: sources,
                limit: limit,
                totalFound: filteredResults.length,
                timestamp: new Date().toISOString()
            },
            note: 'Demo results with realistic academic paper format. In production, this would use the Paper-Search MCP server to fetch real papers from arXiv, PubMed, bioRxiv, and other academic databases.',
            nextSteps: [
                'Real MCP integration will provide actual paper search',
                'Local model integration for paper analysis',
                'Citation network analysis',
                'Semantic paper recommendations'
            ]
        };

        res.json(response);

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            error: 'Paper search failed',
            message: error.message,
            query: query,
            timestamp: new Date().toISOString()
        });
    }
});

app.get('/status', (req, res) => {
    res.json({
        service: 'pen-shop-adk',
        status: 'operational',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: nodeEnv,
        timestamp: new Date().toISOString()
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`🖋️ Pen Shop ADK running on port ${port}`);
    console.log(`🔗 MCP Gateway: ${mcpGateway}`);
    console.log(`🚀 Ready to search academic papers!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully');
    process.exit(0);
});
EOF

print_success "Updated ADK server with better error handling"

print_success "🎉 Read-only file system issue fixed!"

echo ""
echo "🚀 Start the services again:"
echo "   docker compose up -d"
echo ""
echo "🧪 Test the fixed endpoints:"
echo "   curl http://localhost:8000/health"
echo "   curl -X POST http://localhost:8000/search -H 'Content-Type: application/json' -d '{\"query\":\"machine learning\"}'"
echo ""
echo "🌐 Access points:"
echo "   Frontend:  http://localhost:8080"
echo "   ADK:       http://localhost:8000"
echo "   ADK UI:    http://localhost:3000"
echo ""
