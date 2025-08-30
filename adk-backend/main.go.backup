package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"pen-shop/agents"
	"pen-shop/models"
	"pen-shop/utils"
)

type PenShopMultiAgent struct {
	sequentialAgent models.Agent
	mongodb         *mongo.Client
	catalogueURL    string
	logger          models.Logger
}

type ChatRequest struct {
	Message string `json:"message"`
	UserID  string `json:"user_id,omitempty"`
}

type ChatResponse struct {
	Response       string                 `json:"response"`
	SessionID      string                 `json:"session_id"`
	AgentsUsed     []string               `json:"agents_used,omitempty"`
	ProcessingTime time.Duration          `json:"processing_time_ms"`
	Metadata       map[string]interface{} `json:"metadata,omitempty"`
}

func NewPenShopMultiAgent() (*PenShopMultiAgent, error) {
	logger := utils.NewLogger("PenShop")

	// Get configuration
	openaiKey := os.Getenv("OPENAI_API_KEY")
	baseURL := os.Getenv("OPENAI_BASE_URL")
	model := os.Getenv("AI_DEFAULT_MODEL")
	mcpGateway := os.Getenv("MCPGATEWAY_ENDPOINT")

	if baseURL == "" {
		baseURL = "https://api.openai.com/v1"
	}
	if model == "" {
		model = "gpt-4"
	}
	if mcpGateway == "" {
		mcpGateway = "http://mcp-gateway:8811/sse"
	}

	// Clean up model name
	if strings.HasPrefix(model, "openai/") {
		model = strings.TrimPrefix(model, "openai/")
	}

	// Initialize sequential agent
	sequentialAgent := agents.NewPenShopSequentialAgent(mcpGateway, logger)

	// Register specialized agents
	penResearchAgent := agents.NewPenResearchAgent(logger)
	priceResearchAgent := agents.NewPriceResearchAgent(logger)
	reviewAgent := agents.NewReviewAgent(logger)
	recommendAgent := agents.NewRecommendationAgent(logger)

	// Set MCP configuration for all agents
	penResearchAgent.SetMCPConfig(openaiKey, baseURL, model, mcpGateway)
	priceResearchAgent.SetMCPConfig(openaiKey, baseURL, model, mcpGateway)
	reviewAgent.SetMCPConfig(openaiKey, baseURL, model, mcpGateway)
	recommendAgent.SetMCPConfig(openaiKey, baseURL, model, mcpGateway)

	// Register sub-agents with sequential agent
	sequentialAgent.RegisterSubAgent(penResearchAgent)
	sequentialAgent.RegisterSubAgent(priceResearchAgent)
	sequentialAgent.RegisterSubAgent(reviewAgent)
	sequentialAgent.RegisterSubAgent(recommendAgent)

	// Initialize MongoDB
	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://admin:password@mongodb:27017/penstore"
	}

	var mongoClient *mongo.Client
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI)); err == nil {
		mongoClient = client
		logger.Info("🍃 MongoDB connected")
	} else {
		logger.Error("❌ MongoDB connection failed: %v", err)
	}

	catalogueURL := os.Getenv("CATALOGUE_URL")
	if catalogueURL == "" {
		catalogueURL = "http://pen-catalogue:8081"
	}

	return &PenShopMultiAgent{
		sequentialAgent: sequentialAgent,
		mongodb:         mongoClient,
		catalogueURL:    catalogueURL,
		logger:          logger,
	}, nil
}

func (psma *PenShopMultiAgent) handleChat(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()

	var req ChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Log to MongoDB if available
	if psma.mongodb != nil {
		go func() {
			collection := psma.mongodb.Database("penstore").Collection("ai_conversations")
			collection.InsertOne(context.Background(), map[string]interface{}{
				"message":    req.Message,
				"user_id":    req.UserID,
				"timestamp":  time.Now(),
				"agent_mode": "sequential",
			})
		}()
	}

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	// Create query
	query := models.Query{
		ID:      fmt.Sprintf("query_%d", time.Now().Unix()),
		Content: req.Message,
		UserID:  req.UserID,
		Context: map[string]interface{}{
			"timestamp":    time.Now(),
			"source":       "web_ui",
			"catalogue_url": psma.catalogueURL,
		},
		Priority: 1,
	}

	// Process with sequential agent
	response, err := psma.sequentialAgent.Process(ctx, query)
	if err != nil {
		psma.logger.Error("Failed to process query: %v", err)
		http.Error(w, "Failed to process chat", http.StatusInternalServerError)
		return
	}

	processingTime := time.Since(startTime)

	chatResponse := ChatResponse{
		Response:       response.Content,
		SessionID:      fmt.Sprintf("pen_session_%d", time.Now().Unix()),
		ProcessingTime: processingTime,
		Metadata: map[string]interface{}{
			"agent_mode":      "sequential",
			"query_id":        query.ID,
			"processing_time": processingTime.Milliseconds(),
			"agents_executed": response.Metadata["steps_executed"],
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(chatResponse)
}

func (psma *PenShopMultiAgent) handleHealth(w http.ResponseWriter, r *http.Request) {
	status := map[string]interface{}{
		"status":         "healthy",
		"service":        "pen-shop-sequential-agent",
		"agent_mode":     "sequential",
		"has_openai":     os.Getenv("OPENAI_API_KEY") != "",
		"has_mcp":        os.Getenv("MCPGATEWAY_ENDPOINT") != "",
		"has_mongodb":    psma.mongodb != nil,
		"catalogue":      psma.catalogueURL,
		"timestamp":      time.Now(),
		"architecture":   "ADK Sequential Agent Pattern",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(status)
}

func main() {
	penShop, err := NewPenShopMultiAgent()
	if err != nil {
		log.Fatalf("Failed to initialize pen shop: %v", err)
	}

	r := mux.NewRouter()

	r.HandleFunc("/api/chat", penShop.handleChat).Methods("POST")
	r.HandleFunc("/api/health", penShop.handleHealth).Methods("GET")

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000", "http://localhost:9090", "*"},
		AllowedMethods: []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders: []string{"*"},
	})

	handler := c.Handler(r)
	port := "8000"

	penShop.logger.Info("🖊️ Pen Shop Sequential Agent System starting on port %s", port)
	penShop.logger.Info("🤖 Sequential Agent: ✅ Enabled")
	penShop.logger.Info("🔑 OpenAI: %s", func() string {
		if os.Getenv("OPENAI_API_KEY") != "" {
			return "✅ Configured"
		}
		return "❌ Using fallback responses"
	}())
	penShop.logger.Info("🔗 MCP Gateway: %s", os.Getenv("MCPGATEWAY_ENDPOINT"))

	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
