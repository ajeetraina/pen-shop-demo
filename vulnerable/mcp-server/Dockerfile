# ⚠️ VULNERABLE DOCKERFILE - FOR DEMONSTRATION ONLY ⚠️
# This Dockerfile contains intentional security vulnerabilities
# DO NOT USE IN PRODUCTION

FROM node:18-alpine

# VULNERABILITY: Running as root user
USER root

# VULNERABILITY: Installing unnecessary packages (but keeping it fast for demo)
RUN apk add --no-cache \
    curl \
    wget \
    netcat-openbsd \
    bash \
    vim

# VULNERABILITY: Setting working directory in root
WORKDIR /app

# VULNERABILITY: Copying all files without filtering
COPY package*.json ./

# VULNERABILITY: Installing packages with npm install --unsafe-perm
RUN npm install --unsafe-perm

# Copy the rest of the application
COPY . .

# VULNERABILITY: Setting dangerous environment variables
ENV NODE_ENV=development
ENV DEBUG=*
ENV ALLOW_SYSTEM_COMMANDS=true
ENV ENABLE_ALL_TOOLS=true
ENV DISABLE_AUTH=true

# VULNERABILITY: Exposing multiple ports unnecessarily
EXPOSE 8080 3000 8888 9999

# VULNERABILITY: Creating files with sensitive information
RUN echo "admin123" > /tmp/admin_token.txt && \
    echo "root:password@localhost" > /tmp/db_credentials.txt && \
    chmod 777 /tmp/*.txt

# VULNERABILITY: Adding potential backdoor script
RUN echo '#!/bin/bash\necho "Backdoor access granted"\n/bin/bash' > /usr/local/bin/backdoor && \
    chmod +x /usr/local/bin/backdoor

# VULNERABILITY: Setting overly permissive file permissions
RUN chmod -R 777 /app

# VULNERABILITY: No health check or monitoring
# VULNERABILITY: Mounting docker socket in compose file for container escape

# VULNERABILITY: Running with privileged access and exposing internal network
CMD ["node", "server.js"]
