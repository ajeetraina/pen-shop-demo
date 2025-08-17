# MCP Security Demonstrations

This repository contains comprehensive demos showing security vulnerabilities in MCP (Model Context Protocol) implementations and how to mitigate them using containerized, secure architectures.

## 🎯 What This Demonstrates

- **Prompt Injection Attacks** - How malicious prompts can compromise AI agents
- **Tool Poisoning** - Exploiting MCP tools to access unauthorized data  
- **Data Exfiltration** - Extracting sensitive information through AI interactions
- **Supply Chain Attacks** - Compromised MCP servers and tools
- **Secure Mitigation** - Container-based security architecture

## 🚀 Quick Start

```bash
# Setup environment
cp .env.example .env
# Add your OpenAI API key to .env

# Run vulnerable demo
make demo-vulnerable

# Run secure demo  
make demo-secure

# Run attack simulations
make run-attacks
```

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- OpenAI API key (or compatible LLM API)

## 🎭 Demo Scenarios

### 1. Vulnerable Pen Shop
A deliberately vulnerable e-commerce site selling luxury pens with:
- Direct LLM integration without filtering
- Unprotected MCP tool access
- No input/output sanitization

### 2. Secured Pen Shop  
The same application with security measures:
- MCP Gateway with filtering
- Containerized tool isolation
- Real-time threat detection

### 3. Attack Demonstrations
Live examples of:
- Prompt injection leading to data exposure
- Tool poisoning for unauthorized access
- System prompt extraction
- Customer data exfiltration

## 🛡️ Security Architecture

```
User Input → MCP Gateway → Filtered Tools → Isolated Services
          ↓
    Real-time Monitoring & Alerting
```

## 📊 Monitoring Dashboard

Access the security monitoring dashboard at `http://localhost:3000/dashboard` to see:
- Real-time attack detection
- Blocked malicious requests  
- Security metrics and trends
- Container security status

## ⚠️ Warning

This repository contains intentionally vulnerable code for educational purposes. Do not deploy the vulnerable configurations in production environments.
