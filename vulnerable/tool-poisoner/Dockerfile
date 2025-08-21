FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 8082

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S poisoner -u 1001

USER poisoner

# Start the poisoner
CMD ["node", "poisoner.js"]
