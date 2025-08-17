class SecurityDashboard {
    constructor() {
        this.metrics = {
            total_requests: 0,
            blocked_requests: 0,
            block_rate: 0
        };
        this.init();
    }

    init() {
        this.updateMetrics();
        setInterval(() => this.updateMetrics(), 5000);
        this.loadRecentEvents();
    }

    async updateMetrics() {
        try {
            const response = await fetch('/api/metrics');
            const data = await response.json();
            
            this.metrics = data;
            this.renderMetrics();
        } catch (error) {
            console.error('Failed to fetch metrics:', error);
            this.showOfflineStatus();
        }
    }

    renderMetrics() {
        document.getElementById('total-requests').textContent = this.metrics.requests_total || 0;
        document.getElementById('blocked-requests').textContent = this.metrics.requests_blocked || 0;
        document.getElementById('block-rate').textContent = 
            (this.metrics.block_rate || 0).toFixed(1) + '%';
        
        // Update status indicator
        const indicator = document.getElementById('status-indicator');
        indicator.className = this.metrics.requests_total > 0 ? 'status-green' : 'status-red';
    }

    async loadRecentEvents() {
        try {
            const response = await fetch('/api/logs');
            const events = await response.json();
            this.renderEvents(events);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        }
    }

    renderEvents(events) {
        const container = document.getElementById('security-events');
        
        if (!events || events.length === 0) {
            container.innerHTML = '<p style="color: #aaa;">No security events yet...</p>';
            return;
        }

        container.innerHTML = events.map(event => `
            <div class="event ${event.severity || 'low'}">
                <div class="event-header">
                    <span class="event-type">${event.type || 'Unknown'}</span>
                    <span class="event-time">${new Date(event.timestamp).toLocaleTimeString()}</span>
                </div>
                <div class="event-description">
                    ${event.reason || 'Security event detected'}
                </div>
            </div>
        `).join('');
    }

    showOfflineStatus() {
        const indicator = document.getElementById('status-indicator');
        indicator.className = 'status-red';
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    new SecurityDashboard();
});
