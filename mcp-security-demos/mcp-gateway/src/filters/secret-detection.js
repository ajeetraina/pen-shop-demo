class SecretDetectionFilter {
    constructor(config) {
        this.config = config;
        this.secretPatterns = [
            /sk-[a-zA-Z0-9]{48}/,  // OpenAI API keys
            /xox[baprs]-[a-zA-Z0-9-]+/,  // Slack tokens
            /github_pat_[a-zA-Z0-9_]+/,  // GitHub tokens
            /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,  // Email addresses
            /\b\d{16}\b/,  // Credit card numbers
            /\b\d{3}-\d{2}-\d{4}\b/  // SSN
        ];
    }

    async filter(input) {
        let filtered = input;
        let foundSecrets = [];

        for (const pattern of this.secretPatterns) {
            const matches = input.match(pattern);
            if (matches) {
                foundSecrets.push({
                    type: this.getSecretType(pattern),
                    value: matches[0]
                });
                filtered = filtered.replace(pattern, '[REDACTED]');
            }
        }

        return {
            blocked: false,
            filtered,
            secrets_detected: foundSecrets.length > 0,
            secrets: foundSecrets
        };
    }

    getSecretType(pattern) {
        const patternString = pattern.toString();
        if (patternString.includes('sk-')) return 'api_key';
        if (patternString.includes('@')) return 'email';
        if (patternString.includes('\\d{16}')) return 'credit_card';
        if (patternString.includes('\\d{3}-\\d{2}-\\d{4}')) return 'ssn';
        return 'unknown';
    }
}

module.exports = SecretDetectionFilter;
