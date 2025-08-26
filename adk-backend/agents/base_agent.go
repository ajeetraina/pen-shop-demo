package agents

// BaseAgent provides common functionality for all agents
type BaseAgent struct {
	name         string
	capabilities []string
	priority     int
	openaiKey    string
	baseURL      string
	model        string
	mcpGateway   string
}

func NewBaseAgent(name string, capabilities []string, priority int) *BaseAgent {
	return &BaseAgent{
		name:         name,
		capabilities: capabilities,
		priority:     priority,
	}
}

func (ba *BaseAgent) GetName() string {
	return ba.name
}

func (ba *BaseAgent) GetCapabilities() []string {
	return ba.capabilities
}

func (ba *BaseAgent) GetPriority() int {
	return ba.priority
}

func (ba *BaseAgent) SetMCPConfig(openaiKey, baseURL, model, mcpGateway string) {
	ba.openaiKey = openaiKey
	ba.baseURL = baseURL
	ba.model = model
	ba.mcpGateway = mcpGateway
}
