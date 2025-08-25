# 🖊️ Moby Pen Shop Platform


🖊️ Multi-Agent Pen Shop - MCP Security Demo Platform

```mermaid

flowchart TD
    %% User Layer
    Customer[🛒 Customer<br/>Web UI Request]
    
    %% Agent Layer  
    Agent[🤖 Pen Shop Agent<br/>ADK Backend]
    
    %% AI Models
    LLM[🧠 AI Models<br/>OpenAI + qwen3]
    
    %% Research & Analysis
    Research[🔍 Pen Research<br/>Sequential Agent]
    
    %% Security Gateway (Central Component)
    Gateway[🛡️ Docker MCP Gateway<br/>Security Layer<br/>:8811]
    
    %% Security Interceptors
    SecurityFilter[🔒 Security Filter<br/>before:exec]
    ToolGuard[🚫 Tool Access Guard<br/>before:exec] 
    Sanitizer[🧹 Response Sanitizer<br/>after:exec]
    OutputFilter[📏 Output Filter<br/>after:exec]
    
    %% MCP Tools
    BraveSearch[🔍 Brave Search<br/>MCP Tool]
    MongoDB[🍃 MongoDB<br/>MCP Tool]
    WebFetch[🌐 Web Fetch<br/>MCP Tool]
    MoreTools[➕ 25+ More Tools<br/>MCP Catalog]
    
    %% Data Sources
    PenDB[(🗄️ Pen Database<br/>MySQL :3306)]
    ReviewDB[(📝 Reviews & Analytics<br/>MongoDB :27017)]
    Cache[(🔄 Session Cache<br/>Redis :6379)]
    
    %% External APIs
    BraveAPI[🌐 Brave Search API]
    OpenAI_API[🤖 OpenAI API]
    
    %% Demo Interface
    Demo[🎭 Security Demo<br/>UI :8080]
    
    %% Flow Connections
    Customer --> Agent
    Demo -.-> Gateway
    Agent --> LLM
    Agent --> Research
    
    %% Security Gateway Flow
    Research --> Gateway
    Gateway --> SecurityFilter
    SecurityFilter --> ToolGuard
    ToolGuard --> BraveSearch
    ToolGuard --> MongoDB  
    ToolGuard --> WebFetch
    ToolGuard --> MoreTools
    
    %% Response Flow (through security)
    BraveSearch --> Sanitizer
    MongoDB --> Sanitizer
    WebFetch --> Sanitizer
    MoreTools --> Sanitizer
    Sanitizer --> OutputFilter
    OutputFilter --> Research
    
    %% Tool to Data Connections
    BraveSearch -.-> BraveAPI
    MongoDB --> ReviewDB
    WebFetch --> PenDB
    Agent --> Cache
    LLM -.-> OpenAI_API
    
    %% Attack Flow (blocked)
    Attack[⚡ Malicious Request<br/>Prompt Injection] -.-> Gateway
    Gateway -.-> SecurityFilter
    SecurityFilter -.-> Block[🚫 BLOCKED<br/>Security Violation]
    
    %% Styling
    classDef userClass fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef agentClass fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef securityClass fill:#ffebee,stroke:#b71c1c,stroke-width:3px
    classDef interceptorClass fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef toolClass fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef dataClass fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef attackClass fill:#ffcdd2,stroke:#d32f2f,stroke-width:2px,stroke-dasharray: 5 5
    
    class Customer,Demo userClass
    class Agent,Research,LLM agentClass
    class Gateway securityClass
    class SecurityFilter,ToolGuard,Sanitizer,OutputFilter interceptorClass
    class BraveSearch,MongoDB,WebFetch,MoreTools toolClass
    class PenDB,ReviewDB,Cache,BraveAPI,OpenAI_API dataClass
    class Attack,Block attackClass
```

## Quick Start

### Prerequisites
- **Docker & Docker Compose** installed
- **8GB+ RAM** (for AI models)
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ajeetraina/pen-shop-demo
   cd pen-shop-demo
   ```

2. **Add your OpenAI API key:**
   ```bash
   echo "your-actual-openai-api-key" > secret.openai-api-key
   ```

3. **Add your Brave Search key :**
   ```
   bash
   export BRAVE_API_KEY=XXXX
   ```


3. **Start the platform:**
   ```bash
   docker compose up -d --build
   ```

4. **Access the applications:**
   - 🏪 **Main Store**: http://localhost:9090
   - 🤖 **AI Assistant**: http://localhost:3000
   - 📦 **Catalogue API**: http://localhost:8081/catalogue
   - 🧠 **Agent API**: http://localhost:8000/api/health




## Service Details

| Service | Technology | Port | Purpose |
|---------|------------|------|---------|
| `pen-frontend` | React + Nginx | 9090 | E-commerce store UI |
| `pen-catalogue` | Node.js + Express | 8081 | Product catalog API |
| `adk-backend` | Go + Gorilla Mux | 8000 | AI agent backend |
| `adk-ui` | React + Nginx | 3000 | AI chat interface |
| `catalogue-db` | MySQL 8.0 | 3306 | Product database |
| `mongodb` | MongoDB | 27017 | Reviews & AI data |




### **Sample Conversations**
```
I need a fountain pen for daily journaling
```
```
I Liked Montblanc
```
```
What's the difference between ballpoint and rollerball?
```
```
Show me luxury pens under $100
```



