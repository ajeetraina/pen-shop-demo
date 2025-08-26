package agents

import (
	"context"
	"fmt"
	"pen-shop/models"
	"strings"
	"time"
)

// PenShopSequentialAgent orchestrates multiple specialized agents
type PenShopSequentialAgent struct {
	*BaseAgent
	subAgents  map[string]models.Agent
	workflow   *SequentialWorkflow
	mcpGateway string
	logger     models.Logger
}

type SequentialWorkflow struct {
	steps []WorkflowStep
}

type WorkflowStep struct {
	AgentName     string
	Required      bool
	DependsOn     []string
	TimeoutSec    int
	Condition     func(context map[string]interface{}) bool
}

type WorkflowContext struct {
	OriginalQuery string                 `json:"original_query"`
	UserID        string                 `json:"user_id"`
	Timestamp     time.Time              `json:"timestamp"`
	Results       map[string]interface{} `json:"results"`
	Metadata      map[string]interface{} `json:"metadata"`
}

func NewPenShopSequentialAgent(mcpGateway string, logger models.Logger) *PenShopSequentialAgent {
	workflow := &SequentialWorkflow{
		steps: []WorkflowStep{
			{
				AgentName:  "pen_research",
				Required:   true,
				TimeoutSec: 15,
			},
			{
				AgentName:  "price_research",
				Required:   false,
				DependsOn:  []string{"pen_research"},
				TimeoutSec: 10,
			},
			{
				AgentName:  "review_agent",
				Required:   false,
				DependsOn:  []string{"pen_research"},
				TimeoutSec: 10,
			},
			{
				AgentName:  "recommend_agent",
				Required:   true,
				DependsOn:  []string{"pen_research"},
				TimeoutSec: 10,
			},
		},
	}

	return &PenShopSequentialAgent{
		BaseAgent:  NewBaseAgent("pen_shop_sequential", []string{"orchestration", "workflow"}, 1),
		subAgents:  make(map[string]models.Agent),
		workflow:   workflow,
		mcpGateway: mcpGateway,
		logger:     logger,
	}
}

func (psa *PenShopSequentialAgent) RegisterSubAgent(agent models.Agent) {
	psa.subAgents[agent.GetName()] = agent
	psa.logger.Info("Registered sub-agent: %s", agent.GetName())
}

func (psa *PenShopSequentialAgent) CanHandle(query models.Query) float64 {
	content := strings.ToLower(query.Content)
	
	// High confidence for pen-specific queries
	penKeywords := []string{
		"pen", "fountain", "ballpoint", "rollerball", "gel",
		"montblanc", "parker", "waterman", "cross", "pilot",
		"nib", "ink", "writing", "recommend", "suggest", "need", "want",
		"compare", "price", "cost", "buy", "purchase",
	}

	for _, keyword := range penKeywords {
		if strings.Contains(content, keyword) {
			return 0.95 // High confidence for pen-related queries
		}
	}
	
	// Low confidence for simple greetings - let them be handled simply
	greetings := []string{"hello", "hi", "hey", "good morning", "good afternoon"}
	for _, greeting := range greetings {
		if strings.TrimSpace(content) == greeting {
			return 0.2 // Low confidence - should be handled by simple greeting logic
		}
	}
	
	return 0.5 // Default confidence for other queries
}

// Check if this is a simple greeting that doesn't need full workflow
func (psa *PenShopSequentialAgent) isSimpleGreeting(query models.Query) bool {
	content := strings.TrimSpace(strings.ToLower(query.Content))
	simpleGreetings := []string{
		"hello", "hi", "hey", "good morning", "good afternoon", "good evening",
		"how are you", "what's up", "greetings",
	}
	
	for _, greeting := range simpleGreetings {
		if content == greeting || strings.HasPrefix(content, greeting) {
			return true
		}
	}
	return false
}

func (psa *PenShopSequentialAgent) generateSimpleGreeting() string {
	greetings := []string{
		"Hello! Welcome to Moby Pen Shop. I'm your AI pen expert, ready to help you find the perfect writing instrument. What kind of pen are you looking for today?",
		"Hi there! I'm here to help you discover the perfect pen for your needs. Whether you're interested in fountain pens, ballpoints, or need recommendations, just let me know!",
		"Welcome! I'm your personal pen consultant. I can help you compare brands, find pens within your budget, or answer any questions about our luxury pen collection. How can I assist you?",
	}
	
	// Return the first greeting for now (could randomize later)
	return greetings[0]
}

func (psa *PenShopSequentialAgent) Process(ctx context.Context, query models.Query) (models.Response, error) {
	// Handle simple greetings without full workflow
	if psa.isSimpleGreeting(query) {
		psa.logger.Info("👋 Handling simple greeting: %s", query.Content)
		
		return models.Response{
			AgentName:  psa.GetName(),
			Content:    psa.generateSimpleGreeting(),
			Confidence: 0.9,
			Metadata: map[string]interface{}{
				"response_type":   "simple_greeting",
				"workflow_skipped": true,
				"processing_time": 0,
			},
			Timestamp: time.Now(),
		}, nil
	}

	// For non-greeting queries, run the full workflow
	psa.logger.Info("🤖 Starting Sequential Agent workflow for: %s", query.Content)

	workflowCtx := &WorkflowContext{
		OriginalQuery: query.Content,
		UserID:        query.UserID,
		Timestamp:     time.Now(),
		Results:       make(map[string]interface{}),
		Metadata:      make(map[string]interface{}),
	}

	var responses []models.Response
	executedSteps := make(map[string]bool)

	// Execute workflow steps sequentially
	for _, step := range psa.workflow.steps {
		if !psa.checkDependencies(step, executedSteps) {
			continue
		}

		agent := psa.subAgents[step.AgentName]
		if agent == nil {
			if step.Required {
				return models.Response{}, fmt.Errorf("required agent %s not available", step.AgentName)
			}
			continue
		}

		psa.logger.Info("🔄 Executing: %s", step.AgentName)

		stepQuery := models.Query{
			ID:      fmt.Sprintf("%s_%s", query.ID, step.AgentName),
			Content: query.Content,
			Context: map[string]interface{}{
				"workflow_context": map[string]interface{}{
					"OriginalQuery": workflowCtx.OriginalQuery,
					"UserID":        workflowCtx.UserID,
					"Timestamp":     workflowCtx.Timestamp,
					"Results":       workflowCtx.Results,
					"Metadata":      workflowCtx.Metadata,
				},
				"previous_results": workflowCtx.Results,
			},
		}

		stepCtx, cancel := context.WithTimeout(ctx, time.Duration(step.TimeoutSec)*time.Second)
		response, err := agent.Process(stepCtx, stepQuery)
		cancel()

		if err != nil {
			if step.Required {
				return models.Response{}, fmt.Errorf("required agent %s failed: %w", step.AgentName, err)
			}
			continue
		}

		workflowCtx.Results[step.AgentName] = response.Content
		workflowCtx.Metadata[step.AgentName] = response.Metadata
		responses = append(responses, response)
		executedSteps[step.AgentName] = true

		psa.logger.Info("✅ Completed: %s", step.AgentName)
	}

	if len(responses) == 0 {
		return models.Response{}, fmt.Errorf("no agents processed the query")
	}

	finalResponse := psa.synthesizeResponse(workflowCtx, responses)

	return models.Response{
		AgentName:  psa.GetName(),
		Content:    finalResponse,
		Confidence: 0.9,
		Metadata: map[string]interface{}{
			"workflow_type":   "sequential",
			"steps_executed":  len(responses),
			"processing_time": time.Since(workflowCtx.Timestamp).Milliseconds(),
		},
		Timestamp: time.Now(),
	}, nil
}

func (psa *PenShopSequentialAgent) checkDependencies(step WorkflowStep, executed map[string]bool) bool {
	for _, dep := range step.DependsOn {
		if !executed[dep] {
			return false
		}
	}
	return true
}

func (psa *PenShopSequentialAgent) synthesizeResponse(workflowCtx *WorkflowContext, responses []models.Response) string {
	var result strings.Builder

	result.WriteString("Based on my comprehensive analysis:\n\n")

	for _, resp := range responses {
		switch resp.AgentName {
		case "pen_research":
			result.WriteString("**Product Research:**\n")
			result.WriteString(resp.Content)
			result.WriteString("\n\n")
		case "price_research":
			result.WriteString("**Pricing Analysis:**\n")
			result.WriteString(resp.Content)
			result.WriteString("\n\n")
		case "review_agent":
			result.WriteString("**Customer Reviews:**\n")
			result.WriteString(resp.Content)
			result.WriteString("\n\n")
		case "recommend_agent":
			result.WriteString("**My Recommendation:**\n")
			result.WriteString(resp.Content)
			result.WriteString("\n")
		}
	}

	return result.String()
}
