.PHONY: help build demo test clean

help:
	@echo "Pen Shop Demo (following compose-for-agents pattern):"
	@echo "  make build  - Build containers"  
	@echo "  make demo   - Run demo"
	@echo "  make test   - Test API"
	@echo "  make clean  - Clean up"

build:
	docker-compose build

demo:
	docker-compose up -d
	@echo "🖋️ Pen Shop running:"
	@echo "  API: http://localhost:3001/api/pens"
	@echo "  Web: http://localhost:3000"

test:
	curl -s http://localhost:3001/api/pens | jq '.pens[0]'

clean:
	docker-compose down -v
