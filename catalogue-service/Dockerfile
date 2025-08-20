FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json ./
RUN npm install --only=production

# Copy source code
COPY src/ ./src/

EXPOSE 8081

CMD ["node", "src/server.js"]
