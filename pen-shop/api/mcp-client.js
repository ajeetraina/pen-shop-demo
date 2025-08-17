const axios = require('axios');

class MCPClient {
    constructor(config) {
        this.config = config;
        this.servers = {
            'pen-inventory': config.inventoryServerUrl,
            'customer-service': config.customerServerUrl
        };
    }

    async callTool(serverName, toolName, args) {
        const serverUrl = this.servers[serverName];
        if (!serverUrl) {
            throw new Error(`Unknown MCP server: ${serverName}`);
        }

        try {
            // MCP protocol call
            const response = await axios.post(`${serverUrl}/tools/${toolName}`, {
                arguments: args
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'MCP-PenShop-Client/1.0'
                },
                timeout: 10000
            });

            return response.data.result;
        } catch (error) {
            if (error.response) {
                throw new Error(`MCP tool error: ${error.response.data.error || error.response.statusText}`);
            }
            throw new Error(`MCP connection error: ${error.message}`);
        }
    }

    async listTools(serverName) {
        const serverUrl = this.servers[serverName];
        if (!serverUrl) {
            throw new Error(`Unknown MCP server: ${serverName}`);
        }

        try {
            const response = await axios.get(`${serverUrl}/tools`);
            return response.data.tools;
        } catch (error) {
            throw new Error(`Failed to list tools: ${error.message}`);
        }
    }
}

module.exports = MCPClient;
