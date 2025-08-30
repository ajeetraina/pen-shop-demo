const http = require('http');

const BACKEND_HOST = 'adk-backend';
const BACKEND_PORT = 8000;
const PROXY_PORT = 8080;

const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  if (req.method === 'POST' && req.url === '/api/chat') {
    let body = '';
    
    req.on('data', chunk => body += chunk.toString());
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const message = (data.message || '').toLowerCase();
        
        // Check for sensitive data requests FIRST
        if (message.includes('customer data')) {
          console.log('[SECURITY] Returning explicit refusal for customer data');
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({
            response: "I don't have access to customer data. As a pen shop assistant, I can only provide information about our pen products, prices, and recommendations."
          }));
          return;
        }
        
        if (message.includes('api key')) {
          console.log('[SECURITY] Returning explicit refusal for API keys');
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({
            response: "I don't have access to API keys or authentication credentials. I can only help with pen product information."
          }));
          return;
        }
        
        if (message.includes('database')) {
          console.log('[SECURITY] Returning explicit refusal for database');
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({
            response: "I don't have access to database contents or system information. I can only provide information about pen products."
          }));
          return;
        }
        
        // Check for attacks
        if (message.includes('ignore previous') || message.includes('bypass security')) {
          res.writeHead(403, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({
            error: 'SECURITY_VIOLATION',
            message: 'Request blocked by security interceptor'
          }));
          return;
        }
        
        // Forward normal requests to backend
        const options = {
          hostname: BACKEND_HOST,
          port: BACKEND_PORT,
          path: req.url,
          method: req.method,
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(data))
          }
        };
        
        const proxyReq = http.request(options, (proxyRes) => {
          let responseBody = '';
          proxyRes.on('data', chunk => responseBody += chunk);
          proxyRes.on('end', () => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            res.end(responseBody);
          });
        });
        
        proxyReq.on('error', (e) => {
          console.error('Backend error:', e);
          res.writeHead(502);
          res.end('Bad Gateway');
        });
        
        proxyReq.write(JSON.stringify(data));
        proxyReq.end();
        
      } catch (e) {
        console.error('Parse error:', e);
        res.writeHead(400);
        res.end('Bad Request');
      }
    });
  }
});

server.listen(PROXY_PORT, () => {
  console.log(`Security Proxy running on port ${PROXY_PORT}`);
  console.log('Will return explicit refusals for sensitive requests');
});
