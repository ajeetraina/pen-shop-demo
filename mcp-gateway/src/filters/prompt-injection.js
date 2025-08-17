class PromptInjectionFilter {
    constructor(config) {
        this.config = config;
        this.patterns = [
            /ignore\s+previous\s+instructions/i,
            /system\s*:/i,
            /reveal\s+password/i,
            /admin\s+access/i,
            /show\s+me\s+the\s+prompt/i,
            /forget\s+everything/i,
            /act\s+as\s+if/i,
            /pretend\s+you\s+are/i
        ];
    }

    async filter(input) {
        if (!this.config?.prompt_injection_detection?.enabled) {
            return { blocked: false, filtered: input };
        }

        for (const pattern of this.patterns) {
            if (pattern.test(input)) {
                return {
                    blocked: true,
                    reason: 'Prompt injection pattern detected',
                    pattern: pattern.toString()
                };
            }
        }

        return { blocked: false, filtered: input };
    }
}

module.exports = PromptInjectionFilter;
