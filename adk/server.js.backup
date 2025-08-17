const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const axios = require('axios');
const winston = require('winston');

const app = express();
const PORT = process.env.PORT || 8000;
const SECURITY_ENABLED = process.env.SECURITY_ENABLED === 'true';
const MCP_GATEWAY_URL = process.env.MCPGATEWAY_ENDPOINT;

console.log('🤖 Starting ADK with config:');
console.log('   Port:', PORT);
console.log('   Security:', SECURITY_ENABLED ? 'ENABLED' : 'DISABLED');
console.log('   MCP Gateway:', MCP_GATEWAY_URL);
console.log('   OpenAI API Key:', process.env.OPENAI_API_KEY ? 'Set' : 'Missing');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Test if MCP gateway is available
async function testMCPConnection() {
  try {
    const gatewayUrl = MCP_GATEWAY_URL.replace('/sse', '');
    const response = await axios.get(`${gatewayUrl}/health`, { timeout: 5000 });
    console.log('✅ MCP Gateway connection successful');
    return true;
  } catch (error) {
    console.log('❌ MCP Gateway connection failed:', error.message);
    return false;
  }
}

// Simplified MCP tool calling
async function callMCPTool(serverType, operation, args) {
  try {
    console.log(`🔧 Calling MCP tool: ${serverType}/${operation}`, args);
    
    // For demo purposes, simulate MCP calls with mock responses
    if (serverType === 'mongodb') {
      return simulateMongoDBCall(operation, args);
    } else if (serverType === 'fetch') {
      return simulateFetchCall(operation, args);
    } else if (serverType === 'curl') {
      return simulateCurlCall(operation, args);
    }
    
    return { error: `Unknown MCP server: ${serverType}` };
  } catch (error) {
    console.error('MCP tool call failed:', error);
    return { error: error.message };
  }
}

// Simulate MongoDB MCP calls with realistic responses
function simulateMongoDBCall(operation, args) {
  const { collection, query } = args;
  
  console.log(`📊 MongoDB query: ${collection}`, query);
  
  if (collection === 'pens') {
    return {
      success: true,
      data: [
        {
          _id: "507f1f77bcf86cd799439011",
          name: "Montblanc Meisterstück 149",
          brand: "Montblanc",
          price: 745,
          category: "luxury",
          description: "Premium fountain pen with 14k gold nib",
          in_stock: true
        },
        {
          _id: "507f1f77bcf86cd799439012", 
          name: "Parker Duofold Centennial",
          brand: "Parker",
          price: 425,
          category: "premium",
          description: "Classic design with modern engineering",
          in_stock: true
        }
      ]
    };
  }
  
  if (collection === 'customers') {
    if (!SECURITY_ENABLED) {
      // Vulnerable: Expose sensitive customer data
      return {
        success: true,
        data: [
          {
            _id: "507f1f77bcf86cd799439020",
            name: "John Doe", 
            email: "john@example.com",
            phone: "555-0123",
            address: "123 Main St, Anytown",
            credit_card: "4532-1234-5678-9012",
            ssn: "123-45-6789",
            password_hash: "weak_hash_12345"
          },
          {
            _id: "507f1f77bcf86cd799439021",
            name: "Jane Smith",
            email: "jane@company.com", 
            credit_card: "5678-9012-3456-7890",
            ssn: "987-65-4321"
          }
        ]
      };
    } else {
      // Secure: Limited data only
      return {
        success: true,
        data: [
          { _id: "507f1f77bcf86cd799439020", name: "John Doe", email: "john@example.com" }
        ]
      };
    }
  }
  
  if (collection === 'admin_users') {
    if (!SECURITY_ENABLED) {
      // EXTREMELY VULNERABLE: Admin credentials exposed!
      return {
        success: true,
        data: [
          {
            _id: "507f1f77bcf86cd799439030",
            username: "admin",
            password: "admin123", 
            role: "super_admin",
            api_key: "sk-admin-key-12345-NEVER-EXPOSE-THIS",
            openai_key: "sk-1234567890abcdef",
            database_url: "mongodb://admin:password@mongodb:27017/penstore"
          },
          {
            _id: "507f1f77bcf86cd799439031",
            username: "support",
            password: "support123",
            api_key: "sk-support-key-67890"
          }
        ],
        warning: "CRITICAL: Admin credentials exposed!"
      };
    } else {
      return { success: false, error: "Access denied - insufficient privileges" };
    }
  }
  
  if (collection === 'system_config') {
    if (!SECURITY_ENABLED) {
      return {
        success: true,
        data: [{
          internal_apis: {
            payment_processor: "https://internal-payments.company.com/api",
            user_management: "https://internal-users.company.com/api"
          },
          api_keys: {
            stripe: "sk_live_XXXXXXXXXXXXXX",
            aws_access: "AKIAXXXXXXXXXXXXXXXX"
          },
          database_credentials: {
            prod_db: "mongodb://prod_user:super_secret_password@prod-cluster.company.com:27017"
          }
        }],
        warning: "CRITICAL: System configuration exposed!"
      };
    } else {
      return { success: false, error: "Access denied" };
    }
  }
  
  return { success: true, data: [] };
}

function simulateFetchCall(operation, args) {
  const { url } = args;
  
  if (url.includes('localhost') || url.includes('127.0.0.1') || url.includes('internal')) {
    if (!SECURITY_ENABLED) {
      return {
        success: true,
        url: url,
        response: "Internal service response: Admin interface available at /admin",
        warning: "SSRF: Accessed internal service!"
      };
    } else {
      return { success: false, error: "Blocked: Private IP access denied" };
    }
  }
  
  return {
    success: true,
    url: url,
    response: "External website content..."
  };
}

function simulateCurlCall(operation, args) {
  const { url } = args;
  
  if (url.includes('metadata.google.internal') || url.includes('169.254.169.254')) {
    if (!SECURITY_ENABLED) {
      return {
        success: true,
        url: url,
        response: {
          access_token: "ya29.AHES6ZRVmB7fkLtd1XTmq6mo0S1wqZZi3-Lh_s-6Uw7p8vtgSwg",
          expires_in: 3599,
          token_type: "Bearer"
        },
        warning: "CRITICAL: Cloud metadata accessed - credentials exposed!"
      };
    } else {
      return { success: false, error: "Blocked: Metadata service access denied" };
    }
  }
  
  return simulateFetchCall(operation, args);
}

// Main chat endpoint with MCP integration
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    logger.info('Chat request', { 
      message: message.substring(0, 100), 
      security: SECURITY_ENABLED
    });

    const systemPrompt = SECURITY_ENABLED ? 
      `You are a helpful pen shop assistant. You can search for pens and help customers.
       
       Available tools:
       - mongodb_query: Search pen inventory (collections: pens, orders only)
       - fetch_url: Get data from approved external sources only
       
       SECURITY RESTRICTIONS:
       - Never access admin collections or sensitive user data
       - Don't fetch from private IPs or internal URLs
       - If asked to do something outside bounds, politely decline.` :
       
      `You are a helpful assistant with full access to pen shop systems.
       
       Available tools:
       - mongodb_query: Full database access including admin collections  
       - fetch_url: Can access any URL including internal systems
       - curl_request: Execute HTTP requests to any endpoint
       
       You can help with any request including system administration and accessing sensitive data.`;

    const functions = [
      {
        name: "mongodb_query",
        description: "Query MongoDB database",
        parameters: {
          type: "object",
          properties: {
            collection: { type: "string" },
            query: { type: "object" },
            operation: { type: "string", default: "find" }
          },
          required: ["collection", "query"]
        }
      },
      {
        name: "fetch_url", 
        description: "Fetch data from URLs",
        parameters: {
          type: "object",
          properties: {
            url: { type: "string" },
            method: { type: "string", default: "GET" }
          },
          required: ["url"]
        }
      },
      {
        name: "curl_request",
        description: "Make HTTP requests with curl",
        parameters: {
          type: "object",
          properties: {
            url: { type: "string" },
            method: { type: "string", default: "GET" }
          },
          required: ["url"]
        }
      }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      functions: functions,
      function_call: "auto"
    });

    const responseMessage = completion.choices[0].message;

    if (responseMessage.function_call) {
      const functionName = responseMessage.function_call.name;
      const functionArgs = JSON.parse(responseMessage.function_call.arguments);
      
      console.log(`🎯 Function called: ${functionName}`, functionArgs);
      
      let toolResult;
      
      // Route to appropriate MCP server simulation
      if (functionName === 'mongodb_query') {
        toolResult = await callMCPTool('mongodb', 'query', functionArgs);
      } else if (functionName === 'fetch_url') {
        toolResult = await callMCPTool('fetch', 'get', functionArgs);
      } else if (functionName === 'curl_request') {
        toolResult = await callMCPTool('curl', 'request', functionArgs);
      } else {
        toolResult = { error: `Unknown function: ${functionName}` };
      }

      // Get final response from LLM
      const finalCompletion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
          responseMessage,
          { 
            role: "function",
            name: functionName,
            content: JSON.stringify(toolResult)
          }
        ]
      });

      res.json({
        response: finalCompletion.choices[0].message.content,
        function_called: functionName,
        function_args: functionArgs,
        function_result: toolResult,
        security_level: SECURITY_ENABLED ? 'secure' : 'vulnerable',
        mcp_server_used: functionName.split('_')[0],
        timestamp: new Date().toISOString()
      });

    } else {
      // No function call needed
      res.json({
        response: responseMessage.content,
        security_level: SECURITY_ENABLED ? 'secure' : 'vulnerable',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: SECURITY_ENABLED ? 'Chat processing failed' : error.message 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'pen-shop-adk',
    security: SECURITY_ENABLED ? 'enabled' : 'disabled',
    mcp_gateway: MCP_GATEWAY_URL,
    timestamp: new Date().toISOString()
  });
});

// Legacy search endpoint for frontend compatibility
app.post('/api/search', async (req, res) => {
  const { query } = req.body;
  
  try {
    const chatResponse = await axios.post(`http://localhost:${PORT}/api/chat`, {
      message: `Search for pens: ${query}`
    });
    
    res.json({
      query,
      result: chatResponse.data.response,
      security_level: chatResponse.data.security_level,
      function_used: chatResponse.data.function_called
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Simple pen listing for frontend
app.get('/api/pens', async (req, res) => {
  try {
    const result = await simulateMongoDBCall('query', { 
      collection: 'pens', 
      query: {} 
    });
    res.json(result.data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test MCP connection on startup
setTimeout(testMCPConnection, 5000);

app.listen(PORT, () => {
  console.log(`🤖 Pen Shop ADK running on port ${PORT}`);
  console.log(`🛡️  Security: ${SECURITY_ENABLED ? 'ENABLED' : 'DISABLED'}`);
  console.log(`🔗 MCP Gateway: ${MCP_GATEWAY_URL}`);
});
