#!/usr/bin/env node

// Proper Pen Catalog MCP Server
// Implements MCP protocol for pen shop demo

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

// Pen inventory data
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

// Create MCP Server
const server = new Server(
  {
    name: 'pen-catalog',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_pen_catalog',
        description: 'Get the complete pen catalog with all available pens',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'search_pens',
        description: 'Search for pens by brand, category, or price range',
        inputSchema: {
          type: 'object',
          properties: {
            brand: {
              type: 'string',
              description: 'Filter by pen brand (e.g., Montblanc, Parker, Pilot, Lamy)',
            },
            category: {
              type: 'string',
              description: 'Filter by category (luxury, premium, everyday)',
            },
            max_price: {
              type: 'number',
              description: 'Maximum price filter',
            },
            min_price: {
              type: 'number',
              description: 'Minimum price filter',
            },
          },
        },
      },
      {
        name: 'get_pen_details',
        description: 'Get detailed information about a specific pen',
        inputSchema: {
          type: 'object',
          properties: {
            pen_id: {
              type: 'string',
              description: 'The ID of the pen to get details for',
            },
          },
          required: ['pen_id'],
        },
      },
      {
        name: 'check_stock',
        description: 'Check stock availability for a specific pen',
        inputSchema: {
          type: 'object',
          properties: {
            pen_id: {
              type: 'string',
              description: 'The ID of the pen to check stock for',
            },
          },
          required: ['pen_id'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_pen_catalog':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                total_pens: PEN_INVENTORY.length,
                pens: PEN_INVENTORY
              }, null, 2),
            },
          ],
        };

      case 'search_pens':
        let filteredPens = [...PEN_INVENTORY];
        
        if (args.brand) {
          filteredPens = filteredPens.filter(pen => 
            pen.brand.toLowerCase().includes(args.brand.toLowerCase())
          );
        }
        
        if (args.category) {
          filteredPens = filteredPens.filter(pen => 
            pen.category.toLowerCase() === args.category.toLowerCase()
          );
        }
        
        if (args.min_price) {
          filteredPens = filteredPens.filter(pen => pen.price >= args.min_price);
        }
        
        if (args.max_price) {
          filteredPens = filteredPens.filter(pen => pen.price <= args.max_price);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                results_found: filteredPens.length,
                pens: filteredPens
              }, null, 2),
            },
          ],
        };

      case 'get_pen_details':
        const pen = PEN_INVENTORY.find(p => p.id === args.pen_id);
        if (!pen) {
          throw new McpError(ErrorCode.InvalidRequest, `Pen with ID ${args.pen_id} not found`);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                pen: pen
              }, null, 2),
            },
          ],
        };

      case 'check_stock':
        const stockPen = PEN_INVENTORY.find(p => p.id === args.pen_id);
        if (!stockPen) {
          throw new McpError(ErrorCode.InvalidRequest, `Pen with ID ${args.pen_id} not found`);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                pen_id: stockPen.id,
                pen_name: stockPen.name,
                in_stock: stockPen.in_stock,
                stock_count: stockPen.stock_count,
                availability: stockPen.in_stock ? 'Available' : 'Out of Stock'
              }, null, 2),
            },
          ],
        };

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error.message}`);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🖋️ Pen Catalog MCP Server running');
  console.error('📋 Available tools: get_pen_catalog, search_pens, get_pen_details, check_stock');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
