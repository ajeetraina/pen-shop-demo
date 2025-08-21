#!/usr/bin/env node

/**
 * ⚠️  VULNERABLE MCP SERVER - FOR DEMONSTRATION ONLY ⚠️
 * This server contains intentional security vulnerabilities
 * DO NOT USE IN PRODUCTION
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  McpError,
  ErrorCode,
} from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

// VULNERABILITY: Global admin access without authentication
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin123';
const ENABLE_ALL_TOOLS = process.env.ENABLE_ALL_TOOLS === 'true';
const ALLOW_SYSTEM_COMMANDS = process.env.ALLOW_SYSTEM_COMMANDS === 'true';

// VULNERABILITY: Database connection with root privileges
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: 'root',
  password: process.env.MYSQL_PASSWORD || 'password',
  database: 'pendb',
};

class VulnerablePenShopMCP {
  constructor() {
    this.server = new Server(
      {
        name: 'vulnerable-pen-shop-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    // List available tools - VULNERABILITY: Exposes all tools without restriction
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = [
        {
          name: 'get_pen_inventory',
          description: 'Get current pen inventory',
          inputSchema: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              admin_token: { type: 'string' }
            },
          },
        },
        {
          name: 'update_pen_price',
          description: 'Update pen pricing',
          inputSchema: {
            type: 'object',
            properties: {
              pen_id: { type: 'string' },
              new_price: { type: 'number' },
              admin_token: { type: 'string' }
            },
          },
        },
        {
          name: 'get_customer_data',
          description: 'Get customer information',
          inputSchema: {
            type: 'object',
            properties: {
              customer_id: { type: 'string' },
              include_sensitive: { type: 'boolean' }
            },
          },
        }
      ];

      // VULNERABILITY: Expose dangerous tools when enabled
      if (ALLOW_SYSTEM_COMMANDS) {
        tools.push(
          {
            name: 'execute_system_command',
            description: 'Execute system commands (DANGEROUS)',
            inputSchema: {
              type: 'object',
              properties: {
                command: { type: 'string' },
                admin_token: { type: 'string' }
              },
              required: ['command']
            },
          },
          {
            name: 'read_system_file',
            description: 'Read system files',
            inputSchema: {
              type: 'object',
              properties: {
                file_path: { type: 'string' },
                admin_token: { type: 'string' }
              },
              required: ['file_path']
            },
          },
          {
            name: 'access_database_direct',
            description: 'Direct database access',
            inputSchema: {
              type: 'object',
              properties: {
                sql_query: { type: 'string' },
                admin_token: { type: 'string' }
              },
              required: ['sql_query']
            },
          }
        );
      }

      return { tools };
    });

    // Handle tool calls - VULNERABILITY: No authentication or input validation
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_pen_inventory':
            return await this.getPenInventory(args);
          
          case 'update_pen_price':
            return await this.updatePenPrice(args);
          
          case 'get_customer_data':
            return await this.getCustomerData(args);
          
          case 'execute_system_command':
            return await this.executeSystemCommand(args);
          
          case 'read_system_file':
            return await this.readSystemFile(args);
          
          case 'access_database_direct':
            return await this.accessDatabaseDirect(args);
          
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Tool ${name} not found`);
        }
      } catch (error) {
        // VULNERABILITY: Detailed error messages expose internal information
        return {
          content: [
            {
              type: 'text',
              text: `ERROR: ${error.message}\nStack trace: ${error.stack}\nInternal state: ${JSON.stringify(process.env, null, 2)}`
            }
          ]
        };
      }
    });

    // List resources - VULNERABILITY: Exposes internal system information
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'pen://inventory/all',
            name: 'Complete Pen Inventory',
            description: 'All pen inventory including internal data',
            mimeType: 'application/json',
          },
          {
            uri: 'pen://customers/all',
            name: 'Customer Database',
            description: 'Complete customer database with sensitive info',
            mimeType: 'application/json',
          },
          {
            uri: 'pen://system/config',
            name: 'System Configuration',
            description: 'Internal system configuration and secrets',
            mimeType: 'application/json',
          },
          {
            uri: 'pen://logs/errors',
            name: 'Error Logs',
            description: 'System error logs with sensitive information',
            mimeType: 'text/plain',
          }
        ],
      };
    });

    // Read resources - VULNERABILITY: No access control
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      
      switch (uri) {
        case 'pen://inventory/all':
          return await this.getCompleteInventory();
        
        case 'pen://customers/all':
          return await this.getCompleteCustomerData();
        
        case 'pen://system/config':
          return await this.getSystemConfig();
        
        case 'pen://logs/errors':
          return await this.getErrorLogs();
        
        default:
          throw new McpError(ErrorCode.InvalidRequest, `Resource ${uri} not found`);
      }
    });
  }

  // VULNERABILITY: No authentication check
  async getPenInventory(args) {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      // VULNERABILITY: SQL injection possible
      const query = `SELECT * FROM pens WHERE category LIKE '%${args.category || ''}%'`;
      const [rows] = await connection.execute(query);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(rows, null, 2)
          }
        ]
      };
    } catch (error) {
      // VULNERABILITY: Exposes database credentials in error
      throw new Error(`Database error: ${error.message}. Connection: ${JSON.stringify(dbConfig)}`);
    } finally {
      await connection.end();
    }
  }

  // VULNERABILITY: Price manipulation without proper authorization
  async updatePenPrice(args) {
    const { pen_id, new_price, admin_token } = args;
    
    // VULNERABILITY: Weak authentication
    if (admin_token !== ADMIN_TOKEN && !ENABLE_ALL_TOOLS) {
      throw new Error(`Invalid admin token. Expected: ${ADMIN_TOKEN}`);
    }

    const connection = await mysql.createConnection(dbConfig);
    
    try {
      // VULNERABILITY: SQL injection possible
      const query = `UPDATE pens SET price = ${new_price} WHERE id = '${pen_id}'`;
      await connection.execute(query);
      
      return {
        content: [
          {
            type: 'text',
            text: `Successfully updated pen ${pen_id} price to $${new_price}`
          }
        ]
      };
    } finally {
      await connection.end();
    }
  }

  // VULNERABILITY: Exposes sensitive customer data
  async getCustomerData(args) {
    const { customer_id, include_sensitive } = args;
    
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      let query = `SELECT * FROM customers WHERE id = '${customer_id}'`;
      if (include_sensitive) {
        query = `
          SELECT c.*, cc.card_number, cc.cvv, cc.expiry_date, 
                 p.ssn, p.income, p.credit_score 
          FROM customers c 
          LEFT JOIN credit_cards cc ON c.id = cc.customer_id 
          LEFT JOIN personal_info p ON c.id = p.customer_id 
          WHERE c.id = '${customer_id}'
        `;
      }
      
      const [rows] = await connection.execute(query);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(rows, null, 2)
          }
        ]
      };
    } finally {
      await connection.end();
    }
  }

  // VULNERABILITY: Direct system command execution
  async executeSystemCommand(args) {
    const { command, admin_token } = args;
    
    if (!ALLOW_SYSTEM_COMMANDS) {
      throw new Error('System commands disabled');
    }
    
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Command failed: ${error.message}\n${stderr}`));
          return;
        }
        
        resolve({
          content: [
            {
              type: 'text',
              text: `Command output:\n${stdout}\n${stderr}`
            }
          ]
        });
      });
    });
  }

  // VULNERABILITY: Unrestricted file access
  async readSystemFile(args) {
    const { file_path } = args;
    
    try {
      const content = fs.readFileSync(file_path, 'utf8');
      return {
        content: [
          {
            type: 'text',
            text: `File: ${file_path}\n\n${content}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  // VULNERABILITY: Direct SQL access
  async accessDatabaseDirect(args) {
    const { sql_query } = args;
    
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      const [rows] = await connection.execute(sql_query);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(rows, null, 2)
          }
        ]
      };
    } finally {
      await connection.end();
    }
  }

  // VULNERABILITY: Exposes complete inventory including costs
  async getCompleteInventory() {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      const [rows] = await connection.execute(`
        SELECT p.*, s.cost_price, s.supplier_info, s.profit_margin 
        FROM pens p 
        LEFT JOIN suppliers s ON p.supplier_id = s.id
      `);
      
      return {
        contents: [
          {
            uri: 'pen://inventory/all',
            mimeType: 'application/json',
            text: JSON.stringify(rows, null, 2)
          }
        ]
      };
    } finally {
      await connection.end();
    }
  }

  // VULNERABILITY: Exposes all customer data including PII
  async getCompleteCustomerData() {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
      const [rows] = await connection.execute(`
        SELECT c.*, cc.*, p.* 
        FROM customers c 
        LEFT JOIN credit_cards cc ON c.id = cc.customer_id 
        LEFT JOIN personal_info p ON c.id = p.customer_id
      `);
      
      return {
        contents: [
          {
            uri: 'pen://customers/all',
            mimeType: 'application/json',
            text: JSON.stringify(rows, null, 2)
          }
        ]
      };
    } finally {
      await connection.end();
    }
  }

  // VULNERABILITY: Exposes system configuration and secrets
  async getSystemConfig() {
    const config = {
      environment: process.env,
      database_config: dbConfig,
      admin_token: ADMIN_TOKEN,
      system_info: {
        platform: process.platform,
        version: process.version,
        memory: process.memoryUsage(),
        uptime: process.uptime()
      }
    };
    
    return {
      contents: [
        {
          uri: 'pen://system/config',
          mimeType: 'application/json',
          text: JSON.stringify(config, null, 2)
        }
      ]
    };
  }

  // VULNERABILITY: Exposes error logs with sensitive info
  async getErrorLogs() {
    try {
      const logContent = fs.readFileSync('/var/log/app.log', 'utf8');
      return {
        contents: [
          {
            uri: 'pen://logs/errors',
            mimeType: 'text/plain',
            text: logContent
          }
        ]
      };
    } catch (error) {
      return {
        contents: [
          {
            uri: 'pen://logs/errors',
            mimeType: 'text/plain',
            text: `No logs available: ${error.message}`
          }
        ]
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🚨 Vulnerable Pen Shop MCP Server running - FOR DEMO ONLY! 🚨');
  }
}

const server = new VulnerablePenShopMCP();
server.run().catch(console.error);
