package agents

import (
	"context"
	"fmt"
	"pen-shop/models"
	"regexp"
	"strconv"
	"strings"
	"time"
)

// PenResearchAgent gathers comprehensive pen information
type PenResearchAgent struct {
	*BaseAgent
	productDatabase map[string]ProductInfo
	logger          models.Logger
}

type ProductInfo struct {
	Brand         string
	Model         string
	Type          string
	NibSizes      []string
	FillingSystem string
	Materials     []string
	Price         float64
	Features      []string
}

func NewPenResearchAgent(logger models.Logger) *PenResearchAgent {
	return &PenResearchAgent{
		BaseAgent: NewBaseAgent("pen_research", []string{"research", "products", "specifications"}, 2),
		productDatabase: map[string]ProductInfo{
			"pilot_g2_premium": {
				Brand:         "Pilot",
				Model:         "G2 Premium",
				Type:          "Gel Pen",
				NibSizes:      []string{"0.7mm", "1.0mm"},
				FillingSystem: "Refillable",
				Materials:     []string{"Metal Body", "Rubber Grip"},
				Price:         12.50,
				Features:      []string{"Smooth Gel Ink", "Retractable", "Professional Look"},
			},
			"parker_jotter_premium": {
				Brand:         "Parker",
				Model:         "Jotter Premium",
				Type:          "Ballpoint Pen",
				NibSizes:      []string{"Medium"},
				FillingSystem: "Refillable",
				Materials:     []string{"Stainless Steel", "Chrome Trim"},
				Price:         46.00,
				Features:      []string{"Click Mechanism", "Reliable", "Classic Design"},
			},
			"cross_century_classic": {
				Brand:         "Cross",
				Model:         "Century Classic",
				Type:          "Ballpoint Pen",
				NibSizes:      []string{"Medium"},
				FillingSystem: "Refillable",
				Materials:     []string{"Chrome Finish"},
				Price:         75.00,
				Features:      []string{"Professional", "Lifetime Warranty", "Gift-worthy"},
			},
			"parker_sonnet": {
				Brand:         "Parker",
				Model:         "Sonnet",
				Type:          "Fountain Pen",
				NibSizes:      []string{"F", "M"},
				FillingSystem: "Cartridge/Converter",
				Materials:     []string{"Stainless Steel", "Gold Trim"},
				Price:         125.00,
				Features:      []string{"Classic Design", "Reliable Feed"},
			},
			"pilot_vanishing_point": {
				Brand:         "Pilot",
				Model:         "Vanishing Point",
				Type:          "Fountain Pen",
				NibSizes:      []string{"EF", "F", "M", "B"},
				FillingSystem: "Cartridge/Converter",
				Materials:     []string{"Brass Body", "Gold Nib"},
				Price:         165.00,
				Features:      []string{"Retractable Nib", "Click Mechanism"},
			},
			"montblanc_meisterstuck_149": {
				Brand:         "Montblanc",
				Model:         "Meisterstück 149",
				Type:          "Fountain Pen",
				NibSizes:      []string{"EF", "F", "M", "B", "BB"},
				FillingSystem: "Piston Converter",
				Materials:     []string{"Black Precious Resin", "14K Gold Nib"},
				Price:         895.00,
				Features:      []string{"Hand-crafted", "Lifetime Warranty", "Flexible Nib"},
			},
		},
		logger: logger,
	}
}

func (pra *PenResearchAgent) extractBudget(content string) (float64, bool) {
	patterns := []string{
		`under\s*\$(\d+)`,
		`less\s+than\s*\$(\d+)`,
		`below\s*\$(\d+)`,
		`\$(\d+)\s*or\s*less`,
		`\$(\d+)\s*max`,
		`maximum\s*\$(\d+)`,
	}
	
	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		if matches := re.FindStringSubmatch(content); len(matches) > 1 {
			if budget, err := strconv.ParseFloat(matches[1], 64); err == nil {
				return budget, true
			}
		}
	}
	
	return 0, false
}

func (pra *PenResearchAgent) CanHandle(query models.Query) float64 {
	content := strings.ToLower(query.Content)
	researchKeywords := []string{
		"specs", "specifications", "features", "compare", "difference",
		"material", "nib", "size", "type", "brand", "show me", "find",
	}

	for _, keyword := range researchKeywords {
		if strings.Contains(content, keyword) {
			return 0.9
		}
	}
	return 0.7
}

func (pra *PenResearchAgent) Process(ctx context.Context, query models.Query) (models.Response, error) {
	pra.logger.Info("🔍 Researching pens for: %s", query.Content)

	content := strings.ToLower(query.Content)
	
	// Check for budget constraints
	budget, hasBudget := pra.extractBudget(content)
	
	var matchedProducts []ProductInfo

	// Filter products based on budget and relevance
	for _, product := range pra.productDatabase {
		// Skip products over budget if budget is specified
		if hasBudget && product.Price > budget {
			continue
		}
		
		if pra.isProductRelevant(product, content) {
			matchedProducts = append(matchedProducts, product)
		}
	}

	// If no products match budget, provide helpful message
	if hasBudget && len(matchedProducts) == 0 {
		response := fmt.Sprintf("I searched our catalog for pens under $%.2f. Unfortunately, our current selection doesn't have quality options in that exact range. The closest options are:\n\n", budget)
		
		// Find the closest options above budget
		var closestProducts []ProductInfo
		minDiff := 1000.0
		
		for _, product := range pra.productDatabase {
			if product.Price > budget {
				diff := product.Price - budget
				if diff < minDiff {
					minDiff = diff
					closestProducts = []ProductInfo{product}
				} else if diff == minDiff {
					closestProducts = append(closestProducts, product)
				}
			}
		}
		
		for i, product := range closestProducts {
			if i >= 2 { // Limit to 2 closest options
				break
			}
			response += fmt.Sprintf("**%s %s** ($%.2f) - only $%.2f over budget\n", 
				product.Brand, product.Model, product.Price, product.Price-budget)
			response += fmt.Sprintf("- %s with %s\n\n", product.Type, strings.Join(product.Features, ", "))
		}
		
		return models.Response{
			AgentName:  pra.GetName(),
			Content:    response,
			Confidence: 0.6,
			Metadata: map[string]interface{}{
				"products_found": 0,
				"budget_constraint": budget,
				"alternatives_shown": len(closestProducts),
			},
			Timestamp: time.Now(),
		}, nil
	}

	response := pra.generateResearchResponse(matchedProducts, content, budget, hasBudget)

	return models.Response{
		AgentName:  pra.GetName(),
		Content:    response,
		Confidence: 0.8,
		Metadata: map[string]interface{}{
			"products_found": len(matchedProducts),
			"research_type":  "budget_filtered",
			"budget_constraint": budget,
		},
		Timestamp: time.Now(),
	}, nil
}

func (pra *PenResearchAgent) isProductRelevant(product ProductInfo, query string) bool {
	searchTerms := []string{
		strings.ToLower(product.Brand),
		strings.ToLower(product.Model),
		strings.ToLower(product.Type),
	}

	for _, term := range searchTerms {
		if strings.Contains(query, term) {
			return true
		}
	}

	// Check for general categories
	if strings.Contains(query, "fountain") && product.Type == "Fountain Pen" {
		return true
	}
	if strings.Contains(query, "ballpoint") && product.Type == "Ballpoint Pen" {
		return true
	}
	if strings.Contains(query, "gel") && product.Type == "Gel Pen" {
		return true
	}
	
	// If no specific type mentioned, include all relevant products
	if !strings.Contains(query, "fountain") && !strings.Contains(query, "ballpoint") && !strings.Contains(query, "gel") {
		return true
	}

	return false
}

func (pra *PenResearchAgent) generateResearchResponse(products []ProductInfo, query string, budget float64, hasBudget bool) string {
	if len(products) == 0 {
		return "I found several pen options that might interest you, but let me check our full catalog for the best matches to your specific requirements."
	}

	var result strings.Builder
	
	if hasBudget {
		result.WriteString(fmt.Sprintf("Here are the best options under $%.2f:\n\n", budget))
	} else {
		result.WriteString("Here's what I found:\n\n")
	}

	for i, product := range products {
		if i >= 3 { // Limit to top 3 results
			break
		}

		result.WriteString(fmt.Sprintf("**%s %s** ($%.2f)\n", product.Brand, product.Model, product.Price))
		result.WriteString(fmt.Sprintf("- Type: %s\n", product.Type))
		result.WriteString(fmt.Sprintf("- Materials: %s\n", strings.Join(product.Materials, ", ")))
		if len(product.NibSizes) > 0 {
			result.WriteString(fmt.Sprintf("- Sizes: %s\n", strings.Join(product.NibSizes, ", ")))
		}
		result.WriteString(fmt.Sprintf("- Key Features: %s\n\n", strings.Join(product.Features, ", ")))
	}

	return result.String()
}
