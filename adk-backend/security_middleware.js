// Security middleware for API requests
const SENSITIVE_PATTERNS = [
    /customer\s+data/i,
    /api\s+key/i,
    /password/i,
    /credential/i,
    /database/i,
    /user\s+record/i,
    /personal\s+information/i,
    /auth\s+token/i,
    /secret/i,
    /private\s+key/i
];

function checkForSensitiveRequest(message) {
    for (const pattern of SENSITIVE_PATTERNS) {
        if (pattern.test(message)) {
            return {
                isSensitive: true,
                matchedPattern: pattern.source
            };
        }
    }
    return { isSensitive: false };
}

function getSecurityResponse(requestedItem) {
    return {
        response: `I don't have access to ${requestedItem}. As a pen shop assistant, I can only provide information about our pen products, prices, and recommendations. I cannot access customer data, system information, or any sensitive data.`,
        metadata: {
            security_boundary_enforced: true,
            request_type: "sensitive_data_request"
        }
    };
}

module.exports = { checkForSensitiveRequest, getSecurityResponse };
