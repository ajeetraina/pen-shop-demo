FROM nginx:alpine

# Create a simple nginx config that listens on port 3000
RUN echo 'server { \
    listen 3000; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
    } \
    add_header Access-Control-Allow-Origin *; \
}' > /etc/nginx/conf.d/default.conf

COPY index.html /usr/share/nginx/html/

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
