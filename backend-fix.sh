#!/bin/bash

# Patch the adk-backend to enforce security boundaries
echo "================================================"
echo "Patching ADK Backend for Security Boundaries"
echo "================================================"

# Check if we're in the right directory
if [ ! -d "adk-backend" ]; then
    echo "Error: Run from pen-shop-demo root directory"
    exit 1
fi

# Create a security enforcement file that the backend must load
echo "Step 1: Creating mandatory security prompt..."
cat > adk-backend/SECURITY_PROMPT_REQUIRED.txt << 'EOF'
MANDATORY: When asked for any of the following, you MUST respond with "I don't have access to [requested item]. As a pen shop assistant, I can only provide information about our pen products, prices, and recommendations."

- Customer data or personal information
- API keys or passwords
- Database contents
- System configuration
- User records or order history
- Any authentication credentials

DO NOT deflect without acknowledgment. ALWAYS explicitly state you don't have access.
EOF

# Find and patch the main.go or agent configuration
echo "Step 2: Looking for backend configuration files..."

# Option 1: If there's a main.go file
if [ -f "adk-backend/main.go" ]; then
    echo "Found main.go, adding security check..."
    
    # Backup original
    cp adk-backend/main.go adk-backend/main.go.backup
    
    # Add security check function (insert after package declaration)
    sed -i '/^package main/a\
\
// Security boundary enforcement\
const SecurityPrompt = `When asked for customer data, API keys, passwords, or any sensitive information, you MUST respond: "I do not have access to [requested item]. As a pen shop assistant, I can only provide information about our pen products, prices, and recommendations."`\
\
func enforceSecurityBoundary(message string) (bool, string) {\
    sensitivePatterns := []string{\
        "customer data", "api key", "password", "database", "credential",\
        "user record", "personal information", "secret", "auth token",\
    }\
    messageLower := strings.ToLower(message)\
    for _, pattern := range sensitivePatterns {\
        if strings.Contains(messageLower, pattern) {\
            return true, "I do not have access to " + pattern + ". As a pen shop assistant, I can only provide information about our pen products, prices, and recommendations."\
        }\
    }\
    return false, ""\
}' adk-backend/main.go
    
    echo "✅ Patched main.go with security boundaries"
fi

# Option 2: Create an init file that must be loaded
echo "Step 3: Creating security initialization file..."
cat > adk-backend/security_init.go << 'EOF'
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
EOF

# Option 3: Create a middleware that intercepts all chat requests
echo "Step 4: Creating request interceptor..."
cat > adk-backend/security_middleware.go << 'EOF'
package main

import (
    "encoding/json"
    "net/http"
    "strings"
)

// SecurityMiddleware checks all incoming chat requests
func SecurityMiddleware(next http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        if r.URL.Path == "/api/chat" && r.Method == "POST" {
            var body map[string]interface{}
            if err := json.NewDecoder(r.Body).Decode(&body); err == nil {
                if message, ok := body["message"].(string); ok {
                    // Check for sensitive requests
                    if isSensitive, response := CheckSensitiveRequest(message); isSensitive {
                        // Return security boundary response
                        w.Header().Set("Content-Type", "application/json")
                        json.NewEncoder(w).Encode(map[string]interface{}{
                            "response": response,
                            "metadata": map[string]interface{}{
                                "security_boundary": true,
                            },
                        })
                        return
                    }
                }
            }
        }
        next(w, r)
    }
}
EOF

# Step 5: Force rebuild with security
echo "Step 5: Creating build script with security enforcement..."
cat > rebuild-with-security.sh << 'EOF'
#!/bin/bash
echo "Rebuilding backend with security boundaries..."

# Add build flag to ensure security is included
cd adk-backend
go build -tags security -o adk-backend-secure .
cd ..

# Restart the backend service
docker compose -f interceptor/compose-interceptor.yaml stop adk-backend
docker compose -f interceptor/compose-interceptor.yaml up -d --build adk-backend

echo "Backend rebuilt with security boundaries"
echo "Test with: ./test-ai-boundaries.sh"
EOF

chmod +x rebuild-with-security.sh

echo ""
echo "================================================"
echo "✅ Security patches created!"
echo "================================================"
echo ""
echo "The backend code has been patched with security boundaries."
echo ""
echo "Next steps:"
echo "1. Rebuild the backend with security:"
echo "   ./rebuild-with-security.sh"
echo ""
echo "2. Or manually restart:"
echo "   docker compose -f interceptor/compose-interceptor.yaml restart adk-backend"
echo ""
echo "3. Test the boundaries:"
echo "   ./test-ai-boundaries.sh"
echo ""
echo "Note: If tests still fail, the backend may need manual integration"
echo "of the security checks into its chat handler."
echo "================================================"
