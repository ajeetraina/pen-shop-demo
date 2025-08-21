# ⚠️ VULNERABLE DOCKERFILE - FOR DEMONSTRATION ONLY ⚠️
# This Dockerfile contains intentional security vulnerabilities
# DO NOT USE IN PRODUCTION

FROM nginx:alpine

# VULNERABILITY: Running as root (default nginx behavior)
# VULNERABILITY: No health checks or security headers

# Copy vulnerable HTML frontend
COPY index.html /usr/share/nginx/html/index.html

# VULNERABILITY: Overly permissive nginx configuration
RUN echo 'server {' > /etc/nginx/conf.d/default.conf && \
    echo '    listen 80;' >> /etc/nginx/conf.d/default.conf && \
    echo '    server_name localhost;' >> /etc/nginx/conf.d/default.conf && \
    echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    index index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    # VULNERABILITY: No security headers' >> /etc/nginx/conf.d/default.conf && \
    echo '    # VULNERABILITY: Allow all origins for CORS' >> /etc/nginx/conf.d/default.conf && \
    echo '    location / {' >> /etc/nginx/conf.d/default.conf && \
    echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '        add_header Access-Control-Allow-Origin "*";' >> /etc/nginx/conf.d/default.conf && \
    echo '        add_header Access-Control-Allow-Methods "*";' >> /etc/nginx/conf.d/default.conf && \
    echo '        add_header Access-Control-Allow-Headers "*";' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '    # VULNERABILITY: Expose API without authentication' >> /etc/nginx/conf.d/default.conf && \
    echo '    location /api/ {' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_pass http://vulnerable-mcp-server:8080/;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_set_header Host $host;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_set_header X-Real-IP $remote_addr;' >> /etc/nginx/conf.d/default.conf && \
    echo '        # VULNERABILITY: Forward all headers without filtering' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_pass_request_headers on;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '}' >> /etc/nginx/conf.d/default.conf

# VULNERABILITY: Expose internal debugging information
RUN echo 'error_log /var/log/nginx/error.log debug;' >> /etc/nginx/nginx.conf

# VULNERABILITY: No security updates
# VULNERABILITY: No user restrictions  
# VULNERABILITY: No network restrictions

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
