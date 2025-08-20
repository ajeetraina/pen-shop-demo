#!/usr/bin/env python3

import os
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
import uvicorn
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Pen Shop Agent", version="1.0.0")

MCPGATEWAY_ENDPOINT = os.getenv('MCPGATEWAY_ENDPOINT', 'http://localhost:8811/sse')
CATALOGUE_URL = os.getenv('CATALOGUE_URL', 'http://localhost:8081')
SHOP_NAME = os.getenv('SHOP_NAME', 'Premium Pen Emporium')

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return f"""
    <!DOCTYPE html>
    <html>
    <head><title>🖋️ {SHOP_NAME}</title></head>
    <body>
        <h1>🖋️ {SHOP_NAME}</h1>
        <p>Secure AI Agent Demo</p>
        <p>✅ ADK Agent Running</p>
        <p>✅ MCP Gateway: {MCPGATEWAY_ENDPOINT}</p>
        <p>✅ Catalogue: {CATALOGUE_URL}</p>
    </body>
    </html>
    """

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "pen-shop-agent"}

if __name__ == "__main__":
    print(f"🖋️ Starting {SHOP_NAME} Agent on port 8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
