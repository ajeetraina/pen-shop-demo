# Security Boundary Integration

## For Go Backend (adk-backend)

1. Locate your agent initialization code
2. Add the security prompt to your system prompt:
   ```go
   systemPrompt := SecurityPrompt + "\n" + originalPrompt
   ```

3. Update your chat handler to check for sensitive requests:
   ```go
   if containsSensitiveRequest(message) {
       return securityBoundaryResponse(message)
   }
   ```

## For Python Backend

1. Import the security configuration:
   ```python
   from security_config import add_security_to_prompt
   ```

2. Update your agent prompts:
   ```python
   agent_prompt = add_security_to_prompt(base_prompt)
   ```

## For Node.js Backend

1. Import the security middleware:
   ```javascript
   const { checkForSensitiveRequest, getSecurityResponse } = require('./security_middleware');
   ```

2. Check requests before processing:
   ```javascript
   const check = checkForSensitiveRequest(message);
   if (check.isSensitive) {
       return getSecurityResponse(check.matchedPattern);
   }
   ```

## Testing

Run `./test-ai-boundaries.sh` to verify the boundaries are working.
