const http = require('http');

const BACKEND_HOST = process.env.BACKEND_HOST || 'adk-backend';
const BACKEND_PORT = process.env.BACKEND_PORT || 8000;
const PROXY_PORT = process.env.PROXY_PORT || 8080;

const BLOCKED_PATTERNS = [
  /ignore.*previous.*instructions/i,
  /bypass.*security/i,
  /admin.*mode/i,
  /drop.*table/i,
  /delete.*from/i,
  /show.*passwords/i
];

const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  if (req.method === 'POST' && req.url === '/api/chat') {
    let body = '';
    
    req.on('data', chunk => body += chunk.toString());
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const message = data.message || '';
        
        for (const pattern of BLOCKED_PATTERNS) {
          if (pattern.test(message)) {
            console.log(`[SECURITY] BLOCKED: ${message}`);
            res.writeHead(403, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({
              error: 'SECURITY_VIOLATION',
              message: 'Request blocked by security interceptor'
            }));
            return;
          }
        }
        
        console.log(`[SECURITY] ALLOWED: ${message}`);
        
        const options = {
          hostname: BACKEND_HOST,
          port: BACKEND_PORT,
          path: req.url,
          method: req.method,
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body)
          }
        };
        
        const proxyReq = http.request(options, (proxyRes) => {
          res.writeHead(proxyRes.statusCode, proxyRes.headers);
          proxyRes.pipe(res);
        });
        
        proxyReq.on('error', (e) => {
          console.error('Backend error:', e);
          res.writeHead(502);
          res.end('Bad Gateway');
        });
        
        proxyReq.write(body);
        proxyReq.end();
        
      } catch (e) {
        console.error('Parse error:', e);
        res.writeHead(400);
        res.end('Bad Request');
      }
    });
  } else {
    const options = {
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: req.url,
      method: req.method,
      headers: req.headers
    };
    
    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });
    
    proxyReq.on('error', (e) => {
      res.writeHead(502);
      res.end('Bad Gateway');
    });
    
    req.pipe(proxyReq);
  }
});

server.listen(PROXY_PORT, () => {
  console.log(`Security Proxy running on port ${PROXY_PORT}`);
  console.log(`Protecting backend on ${BACKEND_HOST}:${BACKEND_PORT}`);
});
