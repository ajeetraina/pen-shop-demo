const express = require('express');
const { createClient } = require('redis');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Redis client for metrics
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD
});

redis.connect().catch(console.error);

app.use(express.static('public'));
app.use(express.json());

// Security metrics endpoint
app.get('/api/metrics', async (req, res) => {
  try {
    const metrics = {
      totalRequests: await redis.get('pen_shop_metrics:total_requests') || 0,
      blockedRequests: await redis.get('pen_shop_metrics:blocked_requests') || 0,
      securityEvents: await redis.llen('pen_shop_security_events') || 0,
      timestamp: new Date().toISOString()
    };
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Security logs endpoint
app.get('/api/logs', (req, res) => {
  try {
    const logPath = process.env.LOG_PATH || '/app/logs';
    const securityLog = path.join(logPath, 'pen-shop-security.log');
    
    if (fs.existsSync(securityLog)) {
      const logs = fs.readFileSync(securityLog, 'utf8')
        .split('\n')
        .filter(line => line.trim())
        .slice(-100)
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return { message: line, timestamp: new Date().toISOString() };
          }
        });
      res.json(logs);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Security dashboard running on port ${port}`);
});
