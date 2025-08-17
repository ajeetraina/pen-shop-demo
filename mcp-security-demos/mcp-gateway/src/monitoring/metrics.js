class MetricsCollector {
    constructor() {
        this.metrics = {
            requests_total: 0,
            requests_blocked: 0,
            requests_allowed: 0,
            blocks_by_type: {
                prompt_injection: 0,
                tool_poisoning: 0,
                rate_limit: 0,
                secret_detection: 0
            },
            recent_events: []
        };
    }

    recordBlocked(type) {
        this.metrics.requests_total++;
        this.metrics.requests_blocked++;
        this.metrics.blocks_by_type[type]++;
        
        this.addEvent({
            type: 'blocked',
            reason: type,
            timestamp: new Date().toISOString(),
            severity: 'high'
        });
    }

    recordAllowed() {
        this.metrics.requests_total++;
        this.metrics.requests_allowed++;
        
        this.addEvent({
            type: 'allowed',
            timestamp: new Date().toISOString(),
            severity: 'low'
        });
    }

    addEvent(event) {
        this.metrics.recent_events.unshift(event);
        
        // Keep only last 100 events
        if (this.metrics.recent_events.length > 100) {
            this.metrics.recent_events.pop();
        }
    }

    getMetrics() {
        return {
            ...this.metrics,
            block_rate: this.metrics.requests_total > 0 ? 
                (this.metrics.requests_blocked / this.metrics.requests_total) * 100 : 0
        };
    }

    getRecentEvents() {
        return this.metrics.recent_events.slice(0, 20);
    }
}

module.exports = MetricsCollector;
