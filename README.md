# 🖊️ Moby Pen Shop Platform

A complete e-commerce platform for luxury writing instruments with AI shopping assistant, built with Docker, React, Go, and Node.js.

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           🖊️ MOBY PEN SHOP PLATFORM                             │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐      ┌────────────────┐    ┌─────────────────────────────────┐
│   👤 Customer   │      │ 🤖 AI Assistant│    │        🌐 External APIs         │
│   Browser       │      │   User         │    │                                 │
└─────────┬───────┘      └────────┬───────┘    │  ┌─────────────────────────────┐│
          │                      │              │  │       OpenAI GPT-4          ││
          │                      │              │  │   (AI Responses)            ││
          ▼                      ▼              │  └─────────────────────────────┘│
┌─────────────────┐    ┌─────────────────┐      └─────────────────────────────────┘
│  🏪 Frontend    │    │  💬 AI UI       │                   ▲
│  (React)        │    │  (React)        │                   │
│  Port: 9090     │    │  Port: 3000     │                   │
│                 │    │                 │                   │
│ • Browse Pens   │    │ • Chat Interface│                   │
│ • View Details  │    │ • Product Advice│                   │
│ • Shopping Cart │    │ • Recommendations│                  │
└─────────┬───────┘    └─────────┬───────┘                   │
          │                      │                           │
          │ HTTP/REST            │ HTTP/REST                 │
          ▼                      ▼                           │
┌─────────────────┐    ┌─────────────────┐                   │
│ 📦 Catalogue     │    │ 🧠 ADK Backend   │                 │
│ Service (Node.js)│    │ (Go)            │───────────────────┘
│ Port: 8081      │    │ Port: 8000      │ OpenAI API
│                 │    │                 │
│ • Product CRUD  │    │ • AI Chat Logic │
│ • Inventory Mgmt│    │ • Smart Responses│
│ • Search & Filter│   │ • Context Aware │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          │ SQL Queries          │ NoSQL Queries
          ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│ 🗄️ MySQL DB     │    │ 🍃 MongoDB      │
│ Port: 3306      │    │ Port: 27017     │
│                 │    │                 │
│ • Pen Catalog   │    │ • Reviews       │
│ • Product Data  │    │ • AI Chat Logs  │
│ • Inventory     │    │ • User Prefs    │
│ • Brands & Types│    │ • Conversations │
└─────────────────┘    └─────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              🐳 DOCKER ECOSYSTEM                               │
│                                                                                │
│  All services containerized with Docker Compose orchestration                  │
│  • Automated builds and deployment                                             │
│  • Service discovery and networking                                            │
│  • Volume persistence for databases                                            │
│  • Environment-based configuration                                             │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🎯 Key Features

###  **E-commerce Store**
- **Product Catalog**: Browse luxury pens from Montblanc, Parker, Waterman, Cross, Pilot
- **Advanced Search**: Filter by brand, type, price range
- **Product Details**: Specifications, pricing, availability
- **Responsive Design**: Modern React UI with styled-components

###  **AI Shopping Assistant**
- **Smart Recommendations**: Personalized pen suggestions based on needs
- **Expert Knowledge**: Deep understanding of fountain pens, ballpoints, rollerballs
- **Budget Guidance**: Recommendations across all price ranges ($12-$895)
- **Writing Style Analysis**: Matches pens to user's writing preferences

###  **Technical Stack**
- **Frontend**: React 18, Styled Components, Axios
- **Backend**: Go (Gorilla Mux), Node.js (Express)
- **Databases**: MySQL 8.0, MongoDB
- **AI**: OpenAI GPT-4 integration
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx

## 📁 Project Structure

```
pen-shop-platform/
├── 📄 compose.yaml              # Docker Compose orchestration
├── 📄 start.sh                  # Quick start script
├── 📄 .gitignore               # Git ignore rules
├── 📄 secret.openai-api-key    # OpenAI API key (local only)
│
├── 🏪 frontend/                 # React E-commerce Store
│   ├── 📄 Dockerfile
│   ├── 📄 package.json
│   ├── 📄 nginx.conf
│   ├── 📁 public/
│   │   └── 📄 index.html
│   └── 📁 src/
│       ├── 📄 App.js           # Main store application
│       └── 📄 index.js
│
├── 📦 catalogue-service/        # Node.js Product API
│   ├── 📄 Dockerfile
│   ├── 📄 package.json
│   └── 📁 src/
│       └── 📄 server.js        # Express API server
│
├── 🧠 adk-backend/             # Go AI Backend
│   ├── 📄 Dockerfile
│   ├── 📄 go.mod
│   ├── 📄 main.go              # Go web server
│   └── 📄 entrypoint.sh
│
├── 💬 adk-ui/                  # React AI Assistant
│   ├── 📄 Dockerfile
│   ├── 📄 package.json
│   ├── 📁 public/
│   │   └── 📄 index.html
│   └── 📁 src/
│       ├── 📄 App.js           # Chat interface
│       └── 📄 index.js
│
└── 🗄️ data/                    # Database Initialization
    ├── 📁 mysql-init/
    │   └── 📄 01-create-tables.sql  # Pen products schema
    └── 📁 mongodb-init/
        └── 📄 init-reviews.js       # Customer reviews data
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
   # Copy the template and add your key
   cp secret.openai-api-key.template secret.openai-api-key
   echo "your-actual-openai-api-key" > secret.openai-api-key
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


```

 data storage
