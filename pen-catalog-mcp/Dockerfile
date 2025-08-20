FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY pen-catalog-server.js ./
COPY data/ ./data/

RUN addgroup -g 1001 -S penuser && \
    adduser -S penuser -u 1001 -G penuser
RUN chown -R penuser:penuser /app
USER penuser

EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["node", "pen-catalog-server.js"]
