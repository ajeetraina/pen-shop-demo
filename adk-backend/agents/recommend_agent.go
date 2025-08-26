package agents

import (
	"context"
	"pen-shop/models"
	"strings"
	"time"
)

// RecommendationAgent provides personalized pen recommendations
type RecommendationAgent struct {
	*BaseAgent
	logger models.Logger
}

func NewRecommendationAgent(logger models.Logger) *RecommendationAgent {
	return &RecommendationAgent{
		BaseAgent: NewBaseAgent("recommend_agent", []string{"recommendations", "personalization", "ML"}, 3),
		logger:    logger,
	}
}

func (ra *RecommendationAgent) CanHandle(query models.Query) float64 {
	content := strings.ToLower(query.Content)
	recommendKeywords := []string{
		"recommend", "suggest", "what should", "best for", "looking for",
		"need", "want", "which pen", "help me choose",
	}

	for _, keyword := range recommendKeywords {
		if strings.Contains(content, keyword) {
			return 0.85
		}
	}
	return 0.6
}

func (ra *RecommendationAgent) Process(ctx context.Context, query models.Query) (models.Response, error) {
	ra.logger.Info("🎯 Generating recommendations for: %s", query.Content)

	// Get context from previous agents - using interface{} to avoid circular import
	var researchResults string
	var priceResults string

	if workflowInterface, ok := query.Context["workflow_context"]; ok {
		// Access the workflow context data without requiring the exact type
		if workflowData, ok := workflowInterface.(map[string]interface{}); ok {
			if results, ok := workflowData["Results"].(map[string]interface{}); ok {
				if research, exists := results["pen_research"]; exists {
					researchResults = research.(string)
				}
				if price, exists := results["price_research"]; exists {
					priceResults = price.(string)
				}
			}
		}
	}

	recommendation := ra.generatePersonalizedRecommendation(query.Content, researchResults, priceResults)

	return models.Response{
		AgentName:  ra.GetName(),
		Content:    recommendation,
		Confidence: 0.85,
		Metadata: map[string]interface{}{
			"recommendation_type": "personalized",
			"used_research_data":  researchResults != "",
			"used_price_data":     priceResults != "",
		},
		Timestamp: time.Now(),
	}, nil
}

func (ra *RecommendationAgent) generatePersonalizedRecommendation(query, research, pricing string) string {
	content := strings.ToLower(query)

	var result strings.Builder

	// Analyze user intent and preferences
	if strings.Contains(content, "beginner") || strings.Contains(content, "first") {
		result.WriteString("**Perfect for Beginners:**\n")
		result.WriteString("For your first fountain pen, I recommend starting with the **Parker Sonnet** ($125). ")
		result.WriteString("It's reliable, easy to maintain, and writes smoothly on most papers.\n\n")
	} else if strings.Contains(content, "luxury") || strings.Contains(content, "premium") {
		result.WriteString("**Luxury Recommendation:**\n")
		result.WriteString("The **Montblanc Meisterstück 149** ($895) is the ultimate writing instrument. ")
		result.WriteString("Hand-crafted with precious resin and 14K gold nib, it's a lifetime investment.\n\n")
	} else if strings.Contains(content, "daily") || strings.Contains(content, "work") {
		result.WriteString("**Perfect for Daily Use:**\n")
		result.WriteString("The **Pilot Vanishing Point** ($165) is ideal for busy professionals. ")
		result.WriteString("Its retractable nib means you can use it like a ballpoint but with fountain pen elegance.\n\n")
	} else {
		result.WriteString("**My Top Recommendation:**\n")
		result.WriteString("Based on your query, I suggest considering pens that match your writing style and budget. ")
	}

	// Add context from research if available
	if research != "" {
		result.WriteString("**Based on my research:**\n")
		result.WriteString("The options I found should give you excellent performance and value.\n\n")
	}

	result.WriteString("**Next Steps:**\n")
	result.WriteString("• Visit our showroom to try different nib sizes\n")
	result.WriteString("• Consider ink preferences (cartridge vs converter)\n")
	result.WriteString("• Ask about our 30-day return policy\n")

	return result.String()
}
