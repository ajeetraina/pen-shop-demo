#!/usr/bin/env node

// Pen Catalog MCP Server
// Simple, reliable implementation for pen shop demo

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import cors from 'cors';

// Pen inventory data - this is what should show up!
const PEN_INVENTORY = [
  {
    id: "mont-blanc-149",
    name: "Montblanc Meisterstück 149",
    brand: "Montblanc",
    category: "luxury",
    price: 745,
    description: "Premium fountain pen with 14k gold nib",
    in_stock: true,
    stock_count: 12,
    image: "/images/montblanc-149.jpg"
  },
  {
    id: "parker-sonnet",
    name: "Parker Sonnet Premium",
    brand: "Parker",
    category: "premium", 
    price: 245,
    description: "Elegant ballpoint with gold trim",
    in_stock: true,
    stock_count: 25,
    image: "/images/parker-sonnet.jpg"
  },
  {
    id: "pilot-custom-74",
    name: "Pilot Custom 74",
    brand: "Pilot",
    category: "premium",
    price: 165,
    description: "Japanese fountain pen with 14k gold nib",
    in_stock: true,
    stock_count: 8,
    image: "/images/pilot-custom-74.jpg"
  },
  {
    id: "lamy-safari",
    name: "Lamy Safari",
    brand: "Lamy",
    category: "everyday",
    price: 35,
    description: "Durable fountain pen for daily use",
    in_stock: true,
    stock_count: 45,
    image: "/images/lamy-safari.jpg"
  }
];

// Create express app for HTTP API
const app = express();
app.use(cors());
app.use(express.json());

// HTTP endpoints for testing
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'pen-catalog-mcp' });
});

app.get('/api/pens', (req, res) => {
  res.json({
    success: true,
    total_pens: PEN_INVENTORY.length,
    pens: PEN_INVENTORY
  });
});

app.get('/api/pens/:id', (req, res) => {
  const pen = PEN_INVENTORY.find(p => p.id === req.params.id);
  if (!pen) {
    return res.status(404).json({ error: 'Pen not found' });
  }
  res.json({ success: true, pen });
});

// Start HTTP server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🖋️ Pen Catalog API running on port ${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET /health - Health check`);
  console.log(`   GET /api/pens - All pens`);
  console.log(`   GET /api/pens/:id - Specific pen`);
  console.log(`\n🎯 This server returns PEN DATA, not research papers!`);
});
