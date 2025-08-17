const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const winston = require('winston');

const app = express();
const PORT = process.env.PORT || 3001;
const SECURITY_ENABLED = process.env.SECURITY_ENABLED === 'true';

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'security.log' })
  ]
});

// Security middleware (only if security enabled)
if (SECURITY_ENABLED) {
  app.use(helmet());
  
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use(limiter);
}

app.use(cors());
app.use(express.json());

// Security logging middleware
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body
  });
  next();
});

// Import routes
const pensRouter = require('./routes/pens');
const searchRouter = require('./routes/search');
const ordersRouter = require('./routes/orders');

app.use('/api/pens', pensRouter);
app.use('/api/search', searchRouter);
app.use('/api/orders', ordersRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    security: SECURITY_ENABLED ? 'enabled' : 'disabled',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error({
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  res.status(500).json({ 
    error: SECURITY_ENABLED ? 'Internal server error' : err.message 
  });
});

app.listen(PORT, () => {
  console.log(`🖊️  Pen Shop API running on port ${PORT}`);
  console.log(`🛡️  Security: ${SECURITY_ENABLED ? 'ENABLED' : 'DISABLED'}`);
});
