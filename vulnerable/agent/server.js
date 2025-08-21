#!/usr/bin/env node

/**
 * ⚠️ VULNERABLE AGENT - FOR DEMONSTRATION ONLY ⚠️
 * This agent contains intentional security vulnerabilities
 * DO NOT USE IN PRODUCTION
 */

import express from 'express';
import fetch from 'node-fetch';
import { exec } from 'child_process';

const app = express();
const PORT = process.env.PORT || 8000;
const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://vulnerable-mcp-server:8080';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// VULNERABILITY: No input validation middleware
app.use(express.json({ limit: '50mb' })); // Unlimited request size
app.use(express.urlencoded({ extended: true }));

// VULNERABILITY: No CORS protection
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

// VULNERABILITY: Expose internal system information
app.get('/health', (req, res) => {
  res.json({
    status: 'vulnerable',
    environment: process.env,
    memory: process.memoryUsage(),
    version: process.version,
    uptime: process.uptime(),
    mcp_server: MCP_SERVER_URL,
    api_key_set: !!OPENAI_API_KEY
  });
});

// VULNERABILITY: No authentication required
app.post('/query', async (req, res) => {
  try {
    const { query, user_input, disable_filtering } = req.body;
    
    console.log('🚨 Received query (no filtering):', query);
    console.log('🚨 User input (not validated):', user_input);
    
    // VULNERABILITY: Direct execution of user input
    if (disable_filtering && query.includes('execute:')) {
      const command = query.split('execute:')[1].trim();
      console.log('🚨 EXECUTING SYSTEM COMMAND:', command);
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          res.json({
            type: 'system_execution',
            error: error.message,
            stderr: stderr,
            command: command
          });
        } else {
          res.json({
            type: 'system_execution',
            result: stdout,
            stderr: stderr,
            command: command
          });
        }
      });
      return;
    }
    
    // VULNERABILITY: Call MCP server without validation
    const mcpResponse = await callMCPServer(query, req.body);
    
    // VULNERABILITY: Return raw MCP response without filtering
    res.json({
      agent_response: mcpResponse,
      user_query: query,
      internal_logs: {
        mcp_server: MCP_SERVER_URL,
        timestamp: new Date().toISOString(),
        request_headers: req.headers,
        processing_flags: req.body
      }
    });
    
  } catch (error) {
    // VULNERABILITY: Expose detailed error information
    res.status(500).json({
      error: error.message,
      stack: error.stack,
      mcp_server: MCP_SERVER_URL,
      environment: process.env,
      request_body: req.body
    });
  }
});

// VULNERABILITY: Unrestricted MCP tool calls
app.post('/mcp-call', async (req, res) => {
  try {
    const { tool_name, arguments: args } = req.body;
    
    console.log('🚨 Direct MCP call (no validation):', tool_name, args);
    
    const response = await fetch(`${MCP_SERVER_URL}/tools/call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: tool_name,
        arguments: args
      })
    });
    
    const result = await response.json();
    res.json(result);
    
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// VULNERABILITY: Administrative endpoint without authentication
app.get('/admin/system-info', (req, res) => {
  res.json({
    server_info: {
      hostname: require('os').hostname(),
      platform: process.platform,
      arch: process.arch,
      versions: process.versions,
      memory: process.memoryUsage(),
      cpu: require('os').cpus(),
      network: require('os').networkInterfaces()
    },
    environment: process.env,
    mcp_configuration: {
      server_url: MCP_SERVER_URL,
      api_key_configured: !!OPENAI_API_KEY
    }
  });
});

// VULNERABILITY: File system access endpoint
app.get('/admin/read-file', (req, res) => {
  const filePath = req.query.path;
  
  if (!filePath) {
    return res.status(400).json({ error: 'path parameter required' });
  }
  
  console.log('🚨 Reading file without validation:', filePath);
  
  require('fs').readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).json({
        error: err.message,
        path: filePath,
        errno: err.errno,
        syscall: err.syscall
      });
    } else {
      res.json({
        path: filePath,
        content: data,
        size: data.length
      });
    }
  });
});

// VULNERABILITY: Unprotected tool poisoning endpoint
app.post('/admin/inject-tool', (req, res) => {
  const { tool_name, tool_implementation } = req.body;
  
  console.log('🚨 Tool injection attempt:', tool_name);
  
  // Simulate tool injection (in reality this would modify the MCP server)
  res.json({
    status: 'injected',
    tool_name: tool_name,
    implementation: tool_implementation,
    timestamp: new Date().toISOString(),
    injector_ip: req.ip,
    message: 'Tool successfully poisoned - all users will now execute malicious code'
  });
});

async function callMCPServer(query, options = {}) {
  try {
    // VULNERABILITY: Pass all options directly to MCP server
    const payload = {
      query: query,
      ...options,
      // VULNERABILITY: Always enable dangerous flags
      enable_system_commands: true,
      disable_auth: true,
      expose_sensitive_data: true
    };
    
    console.log('🚨 Calling MCP server with payload:', payload);
    
    const response = await fetch(`${MCP_SERVER_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // VULNERABILITY: Forward admin token
        'Authorization': 'Bearer admin123',
        'X-Admin-Override': 'true'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`MCP Server error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error('🚨 MCP Server call failed:', error);
    throw error;
  }
}

// VULNERABILITY: No rate limiting or DOS protection
app.use((req, res, next) => {
  console.log(`🚨 ${req.method} ${req.path} - No rate limiting`);
  next();
});

// Start the vulnerable agent
app.listen(PORT, () => {
  console.log(`🚨 Vulnerable Agent running on port ${PORT}`);
  console.log(`🚨 MCP Server: ${MCP_SERVER_URL}`);
  console.log(`🚨 OpenAI API Key: ${OPENAI_API_KEY ? 'SET (EXPOSED)' : 'NOT SET'}`);
  console.log('🚨 WARNING: This agent has NO security measures!');
  console.log('🚨 FOR DEMONSTRATION ONLY - DO NOT USE IN PRODUCTION!');
});
