.PHONY: help setup demo-local demo-secure clean logs health

help:
	@echo "🖋️ Pen Shop Demo Commands"
	@echo ""
	@echo "setup        - Initial setup"
	@echo "demo-local   - Run with local model"
	@echo "demo-secure  - Run secure demo"
	@echo "clean        - Clean up"
	@echo "logs         - Show logs"
	@echo "health       - Check health"

setup:
	@echo "🔧 Setting up pen shop demo..."
	@cp .env.example .env || echo ".env exists"
	@echo "✅ Setup complete!"

demo-local:
	@echo "🚀 Starting secure pen shop demo..."
	@docker compose up --build

demo-secure: demo-local

clean:
	@echo "🧹 Cleaning up..."
	@docker compose down -v
	@docker system prune -f

logs:
	@docker compose logs -f

health:
	@echo "🏥 Checking health..."
	@curl -s http://localhost:8000/health || echo "❌ Agent down"
	@curl -s http://localhost:3000/health || echo "❌ UI down"
