# 🖊️ Luxury Pen Shop Platform

A complete e-commerce platform for luxury writing instruments with AI shopping assistant, built with Docker, React, Go, and Node.js.

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           🖊️ LUXURY PEN SHOP PLATFORM                          │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────────────┐
│   👤 Customer    │    │  🤖 AI Assistant │    │        🌐 External APIs        │
│   Browser        │    │    User          │    │                                 │
└─────────┬───────┘    └─────────┬───────┘    │  ┌─────────────────────────────┐ │
          │                      │             │  │       OpenAI GPT-4          │ │
          │                      │             │  │   (AI Responses)           │ │
          ▼                      ▼             │  └─────────────────────────────┘ │
┌─────────────────┐    ┌─────────────────┐    └─────────────────────────────────┘
│  🏪 Frontend     │    │  💬 AI UI        │                   ▲
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
│ 📦 Catalogue     │    │ 🧠 ADK Backend   │                   │
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
│ 🗄️ MySQL DB     │    │ 🍃 MongoDB       │
│ Port: 3306      │    │ Port: 27017     │
│                 │    │                 │
│ • Pen Catalog   │    │ • Reviews       │
│ • Product Data  │    │ • AI Chat Logs  │
│ • Inventory     │    │ • User Prefs    │
│ • Brands & Types│    │ • Conversations │
└─────────────────┘    └─────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              🐳 DOCKER ECOSYSTEM                               │
│                                                                                 │
│  All services containerized with Docker Compose orchestration                  │
│  • Automated builds and deployment                                             │
│  • Service discovery and networking                                            │
│  • Volume persistence for databases                                            │
│  • Environment-based configuration                                             │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🎯 Key Features

### 🏪 **E-commerce Store**
- **Product Catalog**: Browse luxury pens from Montblanc, Parker, Waterman, Cross, Pilot
- **Advanced Search**: Filter by brand, type, price range
- **Product Details**: Specifications, pricing, availability
- **Responsive Design**: Modern React UI with styled-components

### 🤖 **AI Shopping Assistant**
- **Smart Recommendations**: Personalized pen suggestions based on needs
- **Expert Knowledge**: Deep understanding of fountain pens, ballpoints, rollerballs
- **Budget Guidance**: Recommendations across all price ranges ($12-$895)
- **Writing Style Analysis**: Matches pens to user's writing preferences

### 🛠️ **Technical Stack**
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

## 🚀 Quick Start

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

## 📊 Service Details

| Service | Technology | Port | Purpose |
|---------|------------|------|---------|
| `pen-frontend` | React + Nginx | 9090 | E-commerce store UI |
| `pen-catalogue` | Node.js + Express | 8081 | Product catalog API |
| `adk-backend` | Go + Gorilla Mux | 8000 | AI agent backend |
| `adk-ui` | React + Nginx | 3000 | AI chat interface |
| `catalogue-db` | MySQL 8.0 | 3306 | Product database |
| `mongodb` | MongoDB | 27017 | Reviews & AI data |

## 🖊️ Pen Inventory

Our luxury collection includes:

### **Premium Brands**
- **Montblanc** ($285-$895)
  - StarWalker Black Mystery Rollerball
  - Meisterstück 149 Fountain Pen
  - Pix Blue Edition Ballpoint

- **Parker** ($45-$125)
  - Jotter Premium Stainless Steel
  - Urban Premium Ebony CT
  - Sonnet Stainless Steel GT

- **Waterman** ($95-$180)
  - Expert Deluxe Black GT
  - Hemisphere Stainless Steel CT

- **Cross** ($55-$75)
  - Century Classic Lustrous Chrome
  - Bailey Light Blue Lacquer

- **Pilot** ($12-$165)
  - G2 Premium Retractable Gel
  - Vanishing Point Black Fountain

### **Pen Types**
- **Fountain Pens**: Traditional elegance, perfect for signatures
- **Ballpoint Pens**: Reliable everyday writing
- **Rollerball Pens**: Smooth ink flow, premium feel
- **Gel Pens**: Vibrant colors, comfortable grip

## 🤖 AI Assistant Capabilities

The AI shopping assistant provides:

### **Smart Recommendations**
- Budget-based suggestions ($10-$1000+)
- Writing style matching (formal, casual, artistic)
- Hand size and grip preferences
- Ink type preferences (fountain, gel, ballpoint)

### **Expert Knowledge**
- Detailed brand comparisons
- Nib size explanations (EF, F, M, B)
- Maintenance and care tips
- Gift recommendations

### **Sample Conversations**
```
👤 "I need a fountain pen for daily journaling"
🤖 "For daily journaling, I recommend the Waterman Expert ($180) 
    or Parker Sonnet ($125). Both have smooth medium nibs perfect 
    for extended writing sessions. What's your budget range?"

👤 "Something under $50?"  
🤖 "The Parker Jotter Premium ($45.99) is perfect! It's a reliable 
    ballpoint that writes smoothly and feels premium. Great for 
    daily use and very durable."
```

## 🛠️ Development

### Local Development

Each service can be developed independently:

```bash
# Frontend development
cd frontend && npm start          # Runs on http://localhost:3001

# Catalogue service development  
cd catalogue-service && npm run dev  # Runs on http://localhost:8081

# AI UI development
cd adk-ui && npm start           # Runs on http://localhost:3001
```

### Database Access

```bash
# MySQL (Product Catalog)
mysql -h localhost -P 3306 -u root -p
# Password: password
# Database: pendb

# MongoDB (Reviews & AI Data)
mongosh mongodb://admin:password@localhost:27017/penstore
```

### API Testing

```bash
# Test catalogue API
curl http://localhost:8081/catalogue

# Test AI backend
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me fountain pens"}'

# Health checks
curl http://localhost:8081/health
curl http://localhost:8000/api/health
```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MYSQL_ROOT_PASSWORD` | `password` | MySQL root password |
| `OPENAI_API_KEY` | - | OpenAI API key (required) |
| `CATALOGUE_URL` | `http://pen-catalogue:8081` | Catalogue service URL |
| `MONGODB_URI` | `mongodb://admin:password@mongodb:27017/penstore` | MongoDB connection |

### Docker Volumes

- `mysql_data`: Persistent MySQL data storage
- `mongodb_data`: Persistent MongoDB data storage

## 🐛 Troubleshooting

### Common Issues

**Port Conflicts:**
```bash
# Check what's using the ports
lsof -i :9090,3000,8081,8000,3306,27017

# Stop conflicting services
docker compose down
```

**Database Connection Issues:**
```bash
# Reset databases
docker compose down -v  # Removes volumes
docker compose up --build
```

**Build Failures:**
```bash
# Clean Docker cache
docker system prune -a

# Rebuild from scratch
docker compose build --no-cache
```

**API Key Issues:**
```bash
# Verify API key is set correctly
cat secret.openai-api-key

# Test API key
curl -H "Authorization: Bearer $(cat secret.openai-api-key)" \
  https://api.openai.com/v1/models
```

## 📈 Performance & Scaling

### Resource Requirements
- **Minimum**: 4GB RAM, 2 CPU cores
- **Recommended**: 8GB RAM, 4 CPU cores
- **Storage**: ~2GB for images and data

### Scaling Options
- **Horizontal**: Multiple instances behind load balancer
- **Database**: Read replicas for catalogue-db
- **CDN**: Static assets served from CDN
- **Caching**: Redis for API response caching

## 🔒 Security Features

- **API Key Protection**: Keys stored locally, never committed
- **Input Validation**: All user inputs sanitized
- **Database Security**: Parameterized queries prevent SQL injection
- **CORS Configuration**: Proper cross-origin request handling
- **Container Isolation**: Each service runs in isolated container





