#!/usr/bin/env node
// Pen Catalogue HTTP API Server
// Simple HTTP API like sock-shop catalogue service

import express from 'express';
import cors from 'cors';

// Pen inventory data
const PEN_INVENTORY = [
  {
    id: "mont-blanc-149",
    name: "Montblanc Meisterstück 149 Fountain Pen",
    description: "The flagship fountain pen with 18k gold nib",
    price: 750.00,
    currency: "USD",
    brand: "Montblanc",
    type: "fountain",
    nib: "18k gold",
    color: "black",
    material: "precious resin",
    availability: "in_stock",
    quantity: 15,
    images: ["https://example.com/mont-blanc-149.jpg"],
    tags: ["luxury", "fountain", "gold nib"]
  },
  {
    id: "parker-sonnet",
    name: "Parker Sonnet Fountain Pen",
    description: "Classic design with stainless steel nib",
    price: 145.00,
    currency: "USD",
    brand: "Parker",
    type: "fountain",
    nib: "stainless steel",
    color: "black lacquer",
    material: "lacquer",
    availability: "in_stock", 
    quantity: 32,
    images: ["https://example.com/parker-sonnet.jpg"],
    tags: ["classic", "fountain", "steel nib"]
  },
  {
    id: "pilot-metropolitan",
    name: "Pilot Metropolitan Fountain Pen",
    description: "Affordable fountain pen perfect for beginners",
    price: 18.00,
    currency: "USD",
    brand: "Pilot",
    type: "fountain", 
    nib: "steel",
    color: "black",
    material: "brass",
    availability: "in_stock",
    quantity: 85,
    images: ["https://example.com/pilot-metro.jpg"],
    tags: ["affordable", "beginner", "fountain"]
  },
  {
    id: "cross-century",
    name: "Cross Century II Ballpoint Pen",
    description: "Professional ballpoint with classic styling",
    price: 65.00,
    currency: "USD",
    brand: "Cross",
    type: "ballpoint",
    color: "chrome",
    material: "chrome",
    availability: "in_stock",
    quantity: 42,
    images: ["https://example.com/cross-century.jpg"],
    tags: ["professional", "ballpoint", "chrome"]
  },
  {
    id: "waterman-hemisphere", 
    name: "Waterman Hemisphere Rollerball",
    description: "Elegant rollerball with smooth writing experience",
    price: 89.00,
    currency: "USD",
    brand: "Waterman",
    type: "rollerball",
    color: "matte black",
    material: "lacquer",
    availability: "low_stock",
    quantity: 3,
    images: ["https://example.com/waterman-hemisphere.jpg"],
    tags: ["elegant", "rollerball", "smooth"]
  }
];

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'pen-catalogue' });
});

// Get all pens
app.get('/catalogue', (req, res) => {
  const { brand, type, page = 1, size = 10 } = req.query;
  let filteredPens = PEN_INVENTORY;

  // Filter by brand
  if (brand) {
    filteredPens = filteredPens.filter(pen => 
      pen.brand.toLowerCase().includes(brand.toLowerCase())
    );
  }

  // Filter by type
  if (type) {
    filteredPens = filteredPens.filter(pen => 
      pen.type.toLowerCase() === type.toLowerCase()
    );
  }

  // Pagination
  const startIndex = (page - 1) * size;
  const endIndex = startIndex + parseInt(size);
  const paginatedPens = filteredPens.slice(startIndex, endIndex);

  res.json({
    pens: paginatedPens,
    pagination: {
      page: parseInt(page),
      size: parseInt(size),
      total: filteredPens.length,
      hasNext: endIndex < filteredPens.length
    }
  });
});

// Get pen by ID
app.get('/catalogue/:id', (req, res) => {
  const pen = PEN_INVENTORY.find(p => p.id === req.params.id);
  
  if (!pen) {
    return res.status(404).json({ error: 'Pen not found' });
  }
  
  res.json(pen);
});

// Get pen brands
app.get('/brands', (req, res) => {
  const brands = [...new Set(PEN_INVENTORY.map(pen => pen.brand))];
  res.json({ brands });
});

// Get pen types
app.get('/types', (req, res) => {
  const types = [...new Set(PEN_INVENTORY.map(pen => pen.type))];
  res.json({ types });
});

// Search pens
app.get('/search', (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Query parameter required' });
  }
  
  const searchTerm = q.toLowerCase();
  const results = PEN_INVENTORY.filter(pen => 
    pen.name.toLowerCase().includes(searchTerm) ||
    pen.description.toLowerCase().includes(searchTerm) ||
    pen.brand.toLowerCase().includes(searchTerm) ||
    pen.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
  
  res.json({ results, count: results.length });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Pen Catalogue API running on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  GET /health`);
  console.log(`  GET /catalogue`);
  console.log(`  GET /catalogue/:id`);
  console.log(`  GET /brands`);
  console.log(`  GET /types`);
  console.log(`  GET /search?q=<term>`);
});
