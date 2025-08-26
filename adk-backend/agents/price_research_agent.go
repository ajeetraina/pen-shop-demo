package agents

import (
	"context"
	"pen-shop/models"
	"regexp"
	"strconv"
	"strings"
	"time"
)

// PriceResearchAgent handles budget and pricing analysis
type PriceResearchAgent struct {
	*BaseAgent
	logger models.Logger
}

func NewPriceResearchAgent(logger models.Logger) *PriceResearchAgent {
	return &PriceResearchAgent{
		BaseAgent: NewBaseAgent("price_research", []string{"pricing", "budget", "deals"}, 2),
		logger:    logger,
	}
}

func (pra *PriceResearchAgent) CanHandle(query models.Query) float64 {
	content := strings.ToLower(query.Content)
	priceKeywords := []string{
		"price", "cost", "budget", "cheap", "expensive", "affordable",
		"deal", "discount", "sale", "under", "less than", "$",
	}

	for _, keyword := range priceKeywords {
		if strings.Contains(content, keyword) {
			return 0.9
		}
	}
	return 0.4
}

// Extract budget constraints from the query
func (pra *PriceResearchAgent) extractBudget(content string) (float64, bool) {
	// Look for patterns like "under $10", "$10", "less than $50", etc.
	patterns := []string{
		`under\s*\$(\d+)`,
		`less\s+than\s*\$(\d+)`,
		`below\s*\$(\d+)`,
		`\$(\d+)\s*or\s*less`,
		`\$(\d+)\s*max`,
		`maximum\s*\$(\d+)`,
		`\$(\d+)`,
	}
	
	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		if matches := re.FindStringSubmatch(content); len(matches) > 1 {
			if budget, err := strconv.ParseFloat(matches[1], 64); err == nil {
				pra.logger.Info("💰 Extracted budget constraint: $%.2f", budget)
				return budget, true
			}
		}
	}
	
	return 0, false
}

func (pra *PriceResearchAgent) Process(ctx context.Context, query models.Query) (models.Response, error) {
	pra.logger.Info("💰 Analyzing pricing for: %s", query.Content)

	content := strings.ToLower(query.Content)
	
	// Extract specific budget if mentioned
	budget, hasBudget := pra.extractBudget(content)
	
	var response string
	if hasBudget {
		response = pra.analyzeBudgetConstraint(budget)
	} else {
		response = pra.analyzeGeneralBudget(content)
	}
	
	deals := pra.findCurrentDeals()
	finalResponse := response + "\n\n" + deals

	return models.Response{
		AgentName:  pra.GetName(),
		Content:    finalResponse,
		Confidence: 0.75,
		Metadata: map[string]interface{}{
			"budget_analysis":    true,
			"specific_budget":    hasBudget,
			"budget_amount":      budget,
			"deals_found":        len(strings.Split(deals, "\n")) > 1,
		},
		Timestamp: time.Now(),
	}, nil
}

func (pra *PriceResearchAgent) analyzeBudgetConstraint(budget float64) string {
	if budget <= 15 {
		if budget <= 10 {
			return "**Budget Under $10:**\nI need to be honest - quality fountain pens under $10 are very limited. However, you might find:\n• Pilot G2 Premium Gel Pen ($12.50) - slightly over budget but excellent value\n• Basic ballpoint pens from Parker Jotter series start around $8-12\n• Consider looking at refillable gel pens or quality ballpoints in this range"
		} else {
			return "**Budget Under $15:**\n• Pilot G2 Premium ($12.50) - excellent gel writing experience\n• Basic Parker Jotter models ($8-15) - reliable ballpoint option\n• Quality gel pens and fine-tip markers in this range"
		}
	} else if budget <= 50 {
		return "**Budget Under $50:**\n• Pilot G2 Premium ($12.50) - premium gel pen\n• Parker Jotter Premium ($46) - classic reliable ballpoint\n• Cross Classic Century ($35-45) - professional appearance\n• Quality rollerball options available"
	} else if budget <= 100 {
		return "**Budget Under $100:**\n• Parker Urban Premium ($90) - sleek modern design\n• Cross Century Classic ($75) - timeless professional look\n• Waterman Graduate series ($60-85) - entry-level fountain pens\n• Premium gel and rollerball options"
	} else if budget <= 200 {
		return "**Budget Under $200:**\n• Parker Sonnet ($125) - classic fountain pen design\n• Pilot Vanishing Point ($165) - unique retractable fountain pen\n• Waterman Expert ($180) - reliable daily writer\n• Cross Townsend series ($150-180)"
	} else {
		return "**Premium Budget ($200+):**\n• Montblanc Meisterstück series (starts around $400)\n• High-end Parker and Waterman collections\n• Luxury fountain pens with gold nibs\n• Limited edition and collector pieces"
	}
}

func (pra *PriceResearchAgent) analyzeGeneralBudget(query string) string {
	if strings.Contains(query, "cheap") || strings.Contains(query, "budget") {
		return "**Budget-Friendly Options ($12-$50):**\nPilot G2 Premium ($12.50) and Parker Jotter Premium ($46) offer excellent value."
	} else if strings.Contains(query, "affordable") {
		return "**Affordable Options ($50-$100):**\nCross Century Classic ($75) and Parker Urban Premium ($90) provide premium feel without breaking the bank."
	} else if strings.Contains(query, "luxury") || strings.Contains(query, "premium") {
		return "**Luxury Investment ($200+):**\nMontblanc and premium Parker models offer lifetime value and prestige."
	}

	return "**Price Range Analysis:**\n• Entry Level: $12-$50\n• Mid-Range: $50-$150\n• Premium: $150-$300\n• Luxury: $300+"
}

func (pra *PriceResearchAgent) findCurrentDeals() string {
	return "**Current Promotions:**\n• Free shipping on orders over $75\n• 10% off Parker collection this month\n• Student discounts available with ID"
}
