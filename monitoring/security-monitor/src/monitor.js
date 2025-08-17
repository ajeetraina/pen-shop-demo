const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const winston = require('winston');

const app = express();
const port = process.env.PORT || 9090;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:3001'],
  credentials: true
}));

// Logging setup
const logger = winston.createLogger({
  level: process.env.SECURITY_LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'security.log' })
  ]
});

app.use(morgan('combined', {
  stream: { write: message => logger.info(message.trim()) }
}));

app.use(express.json({ limit: '10mb' }));

// Security monitoring endpoints
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/metrics', (req, res) => {
  res.json({
    requests_total: Math.floor(Math.random() * 1000),
    blocked_requests: Math.floor(Math.random() * 50),
    threats_detected: Math.floor(Math.random() * 10),
    uptime: process.uptime()
  });
});

app.get('/alerts', (req, res) => {
  const alerts = [
    {
      id: 1,
      type: 'info',
      message: 'Paper-search MCP server initialized',
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      type: 'success',
      message: 'Security monitoring active',
      timestamp: new Date().toISOString()
    }
  ];
  
  res.json({ alerts });
});

// MCP security interceptor
app.post('/intercept', (req, res) => {
  const { request, source } = req.body;
  
  logger.info('MCP Request intercepted', { 
    source, 
    method: request?.method,
    timestamp: new Date().toISOString()
  });
  
  // Basic security checks
  const isAllowed = !request?.params?.query?.includes('admin') && 
                   !request?.params?.query?.includes('password');
  
  res.json({ 
    allowed: isAllowed,
    reason: isAllowed ? 'Request approved' : 'Suspicious content detected'
  });
});

app.listen(port, () => {
  logger.info(`🛡️ Security Monitor running on port ${port}`);
  console.log(`🛡️ Security Monitor running on port ${port}`);
});
