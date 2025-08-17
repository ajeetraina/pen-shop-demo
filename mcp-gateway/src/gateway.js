const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const winston = require('winston');
const fs = require('fs');
const yaml = require('js-yaml');

const PromptInjectionFilter = require('./filters/prompt-injection');
const ToolPoisoningFilter = require('./filters/tool-poisoning');
const SecretDetectionFilter = require('./filters/secret-detection');
const MetricsCollector = require('./monitoring/metrics');

class MCPGateway {
    constructor() {
        this.app = express();
        this.dashboardApp = express();
        this.config = this.loadConfig();
        this.metrics = new MetricsCollector();
        this.setupLogger();
        this.setupMiddleware();
        this.setupFilters();
        this.setupRoutes();
        this.setupDashboard();
    }

    loadConfig() {
        try {
            const configFile = fs.readFileSync('./config/gateway.yml', 'utf8');
            return yaml.load(configFile);
        } catch (error) {
            console.warn('Could not load config file, using defaults');
            return {
                gateway: { port: 9000, dashboard_port: 9001 },
                security: { 
                    input_filtering: { enabled: true },
                    output_sanitization: { enabled: true },
                    rate_limiting: { enabled: true }
                }
            };
        }
    }

    setupLogger() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: 'gateway-security.log' })
            ]
        });
    }

    setupMiddleware() {
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use(express.json());

        // Rate limiting
        if (this.config.security?.rate_limiting?.enabled) {
            const limiter = rateLimit({
                windowMs: this.config.security.rate_limiting.window_ms || 900000,
                max: this.config.security.rate_limiting.max_requests || 100,
                handler: (req, res) => {
                    this.metrics.recordBlocked('rate_limit');
                    this.logger.warn('Rate limit exceeded', { ip: req.ip });
                    res.status(429).json({ error: 'Rate limit exceeded' });
                }
            });
            this.app.use(limiter);
        }

        // Request logging
        this.app.use((req, res, next) => {
            this.logger.info('Gateway request', {
                method: req.method,
                url: req.url,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            next();
        });
    }

    setupFilters() {
        this.promptFilter = new PromptInjectionFilter(this.config.security);
        this.poisoningFilter = new ToolPoisoningFilter(this.config.security);
        this.secretFilter = new SecretDetectionFilter(this.config.security);
    }

    setupRoutes() {
        // Security filter endpoint
        this.app.post('/filter', async (req, res) => {
            try {
                const { input, type = 'prompt' } = req.body;
                
                // Apply filters
                const promptResult = await this.promptFilter.filter(input);
                if (promptResult.blocked) {
                    this.metrics.recordBlocked('prompt_injection');
                    this.logger.warn('Prompt injection blocked', { 
                        input: input.substring(0, 100),
                        reason: promptResult.reason 
                    });
                    return res.status(400).json({ 
                        error: 'Potentially malicious input detected',
                        type: 'prompt_injection'
                    });
                }

                const poisoningResult = await this.poisoningFilter.filter(input);
                if (poisoningResult.blocked) {
                    this.metrics.recordBlocked('tool_poisoning');
                    this.logger.warn('Tool poisoning blocked', { 
                        input: input.substring(0, 100),
                        reason: poisoningResult.reason 
                    });
                    return res.status(400).json({ 
                        error: 'Tool poisoning attempt detected',
                        type: 'tool_poisoning'
                    });
                }

                this.metrics.recordAllowed();
                res.json({ 
                    filtered_input: input,
                    security_passed: true 
                });

            } catch (error) {
                this.logger.error('Filter error', { error: error.message });
                res.status(500).json({ error: 'Security filter error' });
            }
        });

        // Health check
        this.app.get('/health', (req, res) => {
            res.json({ 
                status: 'healthy',
                security_enabled: true,
                filters_active: [
                    'prompt_injection',
                    'tool_poisoning', 
                    'secret_detection'
                ],
                timestamp: new Date().toISOString()
            });
        });

        // Metrics endpoint
        this.app.get('/metrics', (req, res) => {
            res.json(this.metrics.getMetrics());
        });
    }

    setupDashboard() {
        this.dashboardApp.use(express.static('dashboard'));
        
        this.dashboardApp.get('/api/metrics', (req, res) => {
            res.json(this.metrics.getMetrics());
        });

        this.dashboardApp.get('/api/logs', (req, res) => {
            // Return recent security events
            res.json(this.metrics.getRecentEvents());
        });
    }

    start() {
        const port = this.config.gateway?.port || 9000;
        const dashboardPort = this.config.gateway?.dashboard_port || 9001;

        this.app.listen(port, () => {
            console.log(`🛡️  MCP Gateway running on port ${port}`);
        });

        this.dashboardApp.listen(dashboardPort, () => {
            console.log(`📊 Security Dashboard running on port ${dashboardPort}`);
        });
    }
}

// Start the gateway
const gateway = new MCPGateway();
gateway.start();
