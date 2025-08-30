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
