package main

import (
    "strings"
)

// SecurityBoundaryPrompt must be added to ALL agent prompts
const SecurityBoundaryPrompt = `
CRITICAL SECURITY REQUIREMENT:
When asked for customer data, API keys, passwords, database contents, or ANY sensitive information:
You MUST respond: "I don't have access to [requested item]. As a pen shop assistant, I can only provide information about our pen products, prices, and recommendations."

Never deflect without explicitly stating you don't have access.
`

// CheckSensitiveRequest checks if a request is asking for sensitive data
func CheckSensitiveRequest(message string) (bool, string) {
    sensitive := map[string]string{
        "customer data":     "customer data",
        "api key":          "API keys",
        "password":         "passwords",
        "database":         "database contents",
        "credential":       "credentials",
        "user record":      "user records",
        "personal info":    "personal information",
        "auth token":       "authentication tokens",
        "secret":           "secrets",
    }
    
    msgLower := strings.ToLower(message)
    for pattern, item := range sensitive {
        if strings.Contains(msgLower, pattern) {
            return true, "I don't have access to " + item + ". As a pen shop assistant, I can only provide information about our pen products, prices, and recommendations. I cannot access customer data, system information, or any sensitive data."
        }
    }
    return false, ""
}

// WrapPromptWithSecurity adds security boundaries to any prompt
func WrapPromptWithSecurity(originalPrompt string) string {
    return SecurityBoundaryPrompt + "\n\n" + originalPrompt
}

func init() {
    // This ensures security boundaries are loaded
    println("[SECURITY] Security boundaries initialized")
}
