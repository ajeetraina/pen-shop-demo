FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install git (needed for go mod)
RUN apk add --no-cache git

# Copy go mod files
COPY go.mod ./
COPY go.sum ./

# Download dependencies and tidy up
RUN go mod download
RUN go mod tidy

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Runtime stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates curl
WORKDIR /root/

# Copy the binary
COPY --from=builder /app/main .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/api/health || exit 1

# Run the binary
CMD ["./main"]
