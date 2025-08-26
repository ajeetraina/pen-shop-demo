package agents

import (
	"context"
	"pen-shop/models"
	"strings"
	"time"
)

// ReviewAgent analyzes customer feedback and reviews
type ReviewAgent struct {
	*BaseAgent
	logger models.Logger
}

func NewReviewAgent(logger models.Logger) *ReviewAgent {
	return &ReviewAgent{
		BaseAgent: NewBaseAgent("review_agent", []string{"reviews", "feedback", "sentiment"}, 2),
		logger:    logger,
	}
}

func (ra *ReviewAgent) CanHandle(query models.Query) float64 {
	content := strings.ToLower(query.Content)
	reviewKeywords := []string{
		"review", "rating", "opinion", "experience", "feedback",
		"what do people say", "how good", "quality",
	}

	for _, keyword := range reviewKeywords {
		if strings.Contains(content, keyword) {
			return 0.8
		}
	}
	return 0.3
}

func (ra *ReviewAgent) Process(ctx context.Context, query models.Query) (models.Response, error) {
	ra.logger.Info("⭐ Analyzing reviews for: %s", query.Content)

	// Simulate review analysis (in real implementation, this would query MongoDB)
	reviews := ra.gatherReviews(query.Content)

	return models.Response{
		AgentName:  ra.GetName(),
		Content:    reviews,
		Confidence: 0.7,
		Metadata: map[string]interface{}{
			"reviews_analyzed": 5,
			"sentiment":        "positive",
		},
		Timestamp: time.Now(),
	}, nil
}

func (ra *ReviewAgent) gatherReviews(query string) string {
	return "**Customer Reviews Summary:**\n• 4.5/5 stars average rating\n• Customers love the smooth writing experience\n• Highly recommended for daily use\n• Excellent build quality noted by 92% of reviewers"
}
