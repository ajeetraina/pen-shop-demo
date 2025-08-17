.PHONY: help setup demo-vulnerable demo-secure run-attacks stop clean

help:
	@echo "MCP Security Demos"
	@echo "=================="
	@echo "setup           - Initial setup and build"
	@echo "demo-vulnerable - Run vulnerable pen shop demo"
	@echo "demo-secure     - Run secure pen shop demo"
	@echo "run-attacks     - Execute attack demonstrations"
	@echo "stop            - Stop all services"
	@echo "clean           - Clean up all containers and volumes"

setup:
	@echo "🔧 Setting up environment..."
	@if [ ! -f .env ]; then cp .env.example .env; echo "⚠️  Please edit .env with your API keys"; fi
	docker-compose -f docker-compose.vulnerable.yml build
	docker-compose -f docker-compose.secure.yml build

demo-vulnerable:
	@echo "🔴 Starting VULNERABLE pen shop demo..."
	docker-compose -f docker-compose.vulnerable.yml up -d
	@echo "✅ Vulnerable demo running at:"
	@echo "   Frontend: http://localhost:8080"
	@echo "   API: http://localhost:3001"
	@echo "   Demo attacks: http://localhost:8080/demo.html"

demo-secure:
	@echo "🟢 Starting SECURE pen shop demo..."
	docker-compose -f docker-compose.secure.yml up -d
	@echo "✅ Secure demo running at:"
	@echo "   Frontend: http://localhost:8081"
	@echo "   API: http://localhost:3002"
	@echo "   Security Dashboard: http://localhost:9001"

run-attacks:
	@echo "⚔️  Running attack demonstrations..."
	./scripts/run-attacks.sh

stop:
	docker-compose -f docker-compose.vulnerable.yml down
	docker-compose -f docker-compose.secure.yml down

clean:
	docker-compose -f docker-compose.vulnerable.yml down -v
	docker-compose -f docker-compose.secure.yml down -v
	docker system prune -f
