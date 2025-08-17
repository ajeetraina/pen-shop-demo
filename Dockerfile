FROM python:3.11-slim

WORKDIR /app

# Install ADK dependencies
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    requests \
    pydantic

# Create simple ADK agent structure
COPY <<EOL ./main.py
from fastapi import FastAPI
import os

app = FastAPI(title="Pen Shop ADK Agent")

@app.get("/")
def root():
    return {
        "service": "pen-shop-adk-agent",
        "status": "running",
        "mcp_gateway": os.getenv("MCPGATEWAY_ENDPOINT"),
        "catalogue_url": os.getenv("PEN_CATALOGUE_URL")
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOL

# Create agents directory
RUN mkdir -p agents

COPY <<EOL ./agents/pen_agent.py
class PenAgent:
    def __init__(self):
        self.name = "Pen Sales Agent"
    
    def search_pens(self, query):
        return f"Searching for pens: {query}"
EOL

EXPOSE 8000
CMD ["python", "main.py"]
