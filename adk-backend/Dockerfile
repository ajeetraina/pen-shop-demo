FROM golang:1.23-alpine AS builder

WORKDIR /app

# Copy source code and go.mod
COPY . .

# Initialize and download dependencies
RUN go mod tidy
RUN go mod download

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o pen-shop-adk .

FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

COPY --from=builder /app/pen-shop-adk .
COPY --from=builder /app/entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]
