// Add this to your adk-backend to force MCP tool usage
// This ensures interceptors will be triggered

package main

import (
    "strings"
    "os"
)

// Add this to your chat handler to force MCP tool usage
func shouldUseMCPTools(message string) bool {
    // Always use MCP tools for demo purposes if FORCE_MCP_TOOL_USAGE is set
    if os.Getenv("FORCE_MCP_TOOL_USAGE") == "true" {
        return true
    }
    
    // Trigger MCP tools for these patterns
    triggers := []string{
        "search", "find", "look up", "web", "reviews",
        "database", "inventory", "products", "pens",
        "github", "repository", "admin", "show", "list",
    }
    
    messageLower := strings.ToLower(message)
    for _, trigger := range triggers {
        if strings.Contains(messageLower, trigger) {
            return true
        }
    }
    return false
}

// Add logging to show when MCP tools are called
func logMCPToolCall(tool, query string) {
    if os.Getenv("DEMO_SHOW_INTERCEPTOR_LOGS") == "true" {
        log.Printf("🔧 Calling MCP Tool: %s with query: %s", tool, query)
        log.Printf("🛡️  This will trigger interceptors!")
    }
}
