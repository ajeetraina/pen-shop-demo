# ⚠️ VULNERABLE DOCKERFILE - FOR DEMONSTRATION ONLY ⚠️
# This Dockerfile contains intentional security vulnerabilities
# DO NOT USE IN PRODUCTION

FROM node:18-alpine

# VULNERABILITY: Running as root user
USER root

# VULNERABILITY: Installing unnecessary packages
RUN apk add --no-cache \
    curl \
    wget \
    bash \
    vim \
    netcat-openbsd

# VULNERABILITY: Setting working directory in root
WORKDIR /app

# VULNERABILITY: Copying all files without filtering
COPY . .

# VULNERABILITY: Installing packages without lock file
RUN npm install

# VULNERABILITY: Setting dangerous environment variables
ENV NODE_ENV=development
ENV DEBUG=*
ENV DISABLE_INPUT_FILTERING=true
ENV ALLOW_SYSTEM_PROMPTS=true
ENV ENABLE_TOOL_POISONING=true

# VULNERABILITY: Exposing multiple ports
EXPOSE 8000 3000 8888

# VULNERABILITY: Setting overly permissive file permissions
RUN chmod -R 777 /app

# VULNERABILITY: No health check or monitoring
CMD ["node", "server.js"]
