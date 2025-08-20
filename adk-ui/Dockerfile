FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY src/ ./src/
COPY public/ ./public/

RUN npm run build

FROM nginx:alpine

# Create custom nginx config for port 3000
RUN echo 'server { \
    listen 3000; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
