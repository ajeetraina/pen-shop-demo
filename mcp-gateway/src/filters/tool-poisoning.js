class ToolPoisoningFilter {
    constructor(config) {
        this.config = config;
        this.sqlPatterns = [
            /;\s*drop\s+table/i,
            /;\s*delete\s+from/i,
            /union\s+select/i,
            /'\s*or\s*'1'\s*=\s*'1/i,
            /--/,
            /\/\*.*\*\//
        ];
        
        this.commandPatterns = [
            /\|\s*nc\s+/i,
            /;\s*cat\s+/i,
            /\$\(/,
            /`.*`/,
            /\|\s*curl/i
        ];
    }

    async filter(input) {
        // Check for SQL injection
        for (const pattern of this.sqlPatterns) {
            if (pattern.test(input)) {
                return {
                    blocked: true,
                    reason: 'SQL injection pattern detected',
                    pattern: pattern.toString()
                };
            }
        }

        // Check for command injection
        for (const pattern of this.commandPatterns) {
            if (pattern.test(input)) {
                return {
                    blocked: true,
                    reason: 'Command injection pattern detected',
                    pattern: pattern.toString()
                };
            }
        }

        return { blocked: false, filtered: input };
    }
}

module.exports = ToolPoisoningFilter;
