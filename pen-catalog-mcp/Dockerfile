FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy the MCP server code
COPY pen-catalog-server.js ./

# Create non-root user
RUN addgroup -g 1001 -S penuser && \
    adduser -S penuser -u 1001 -G penuser

# Set ownership
RUN chown -R penuser:penuser /app
USER penuser

# MCP servers run via stdio, not HTTP
# The server will be started by MCP Gateway
CMD ["node", "pen-catalog-server.js"]
