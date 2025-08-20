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
)

type PenShopADK struct {
	mongodb      *mongo.Client
	catalogueURL string
	mcpGateway   string
	openaiKey    string
}

type ChatRequest struct {
	Message string `json:"message"`
	UserID  string `json:"user_id,omitempty"`
}

type ChatResponse struct {
	Response  string `json:"response"`
	SessionID string `json:"session_id"`
}

type PenProduct struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Brand       string  `json:"brand"`
	Type        string  `json:"type"`
	Price       float64 `json:"price"`
	Description string  `json:"description"`
	InStock     bool    `json:"in_stock"`
}

func NewPenShopADK() (*PenShopADK, error) {
	// Initialize MongoDB connection
	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://admin:password@localhost:27017/penstore"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	mongoClient, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Printf("Warning: Failed to connect to MongoDB: %v", err)
		// Continue without MongoDB - some features will be limited
	}

	catalogueURL := os.Getenv("CATALOGUE_URL")
	if catalogueURL == "" {
		catalogueURL = "http://pen-catalogue:8081"
	}

	mcpGateway := os.Getenv("MCPGATEWAY_ENDPOINT")
	if mcpGateway == "" {
		mcpGateway = "http://mcp-gateway:8811/sse"
	}

	return &PenShopADK{
		mongodb:      mongoClient,
		catalogueURL: catalogueURL,
		mcpGateway:   mcpGateway,
		openaiKey:    os.Getenv("OPENAI_API_KEY"),
	}, nil
}

func (p *PenShopADK) generateResponse(message string) string {
	// Simple rule-based responses for pen shopping
	msgLower := strings.ToLower(message)
	
	if strings.Contains(msgLower, "fountain") {
		return "Fountain pens are excellent for formal writing! I'd recommend checking out our Montblanc Meisterstück 149 ($895) for luxury, or the Waterman Expert ($180) for a great balance of quality and price. Would you like me to show you our full fountain pen collection?"
	}
	
	if strings.Contains(msgLower, "ballpoint") {
		return "Ballpoint pens are perfect for everyday writing! Popular choices include the Parker Jotter Premium ($45.99) and the Cross Century Classic ($75). They're reliable and smooth. What's your budget range?"
	}
	
	if strings.Contains(msgLower, "montblanc") {
		return "Montblanc is the pinnacle of luxury writing instruments! We have the StarWalker Black Mystery Rollerball ($520) and the legendary Meisterstück 149 Fountain Pen ($895). Both are exquisite pieces. Which type of pen interests you more?"
	}
	
	if strings.Contains(msgLower, "budget") || strings.Contains(msgLower, "cheap") || strings.Contains(msgLower, "affordable") {
		return "For budget-friendly options, I recommend the Pilot G2 Premium Gel Pen ($12.50) or the Parker Jotter Premium ($45.99). Both offer excellent writing quality without breaking the bank!"
	}
	
	if strings.Contains(msgLower, "luxury") || strings.Contains(msgLower, "expensive") || strings.Contains(msgLower, "premium") {
		return "Our luxury collection features Montblanc pens - the StarWalker ($520) and Meisterstück 149 ($895). These are investment pieces that will last a lifetime and make exceptional gifts!"
	}
	
	if strings.Contains(msgLower, "gift") {
		return "Pens make wonderful gifts! For a special occasion, consider the Montblanc StarWalker ($520) or Waterman Expert ($180). For everyday gifting, the Parker Jotter Premium ($45.99) or Cross Century Classic ($75) are perfect!"
	}
	
	if strings.Contains(msgLower, "recommendation") || strings.Contains(msgLower, "suggest") {
		return "I'd be happy to recommend the perfect pen! Could you tell me: Are you looking for everyday writing or special occasions? What's your budget range? Do you prefer fountain pens, ballpoints, or gel pens?"
	}
	
	if strings.Contains(msgLower, "hello") || strings.Contains(msgLower, "hi") {
		return "Hello! Welcome to our luxury pen shop. I'm here to help you find the perfect writing instrument. Are you looking for something specific, or would you like me to recommend some of our popular pens?"
	}
	
	// Default response
	return "I'd love to help you find the perfect pen! We have an amazing collection of luxury writing instruments from brands like Montblanc, Parker, Waterman, Cross, and Pilot. What type of pen are you interested in, or do you have any specific questions about our products?"
}

func (p *PenShopADK) handleChat(w http.ResponseWriter, r *http.Request) {
	var req ChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Log the conversation to MongoDB if available
	if p.mongodb != nil {
		go func() {
			collection := p.mongodb.Database("penstore").Collection("ai_conversations")
			_, err := collection.InsertOne(context.Background(), map[string]interface{}{
				"message":   req.Message,
				"user_id":   req.UserID,
				"timestamp": time.Now(),
			})
			if err != nil {
				log.Printf("Failed to log conversation: %v", err)
			}
		}()
	}

	// Generate response
	response := p.generateResponse(req.Message)

	chatResponse := ChatResponse{
		Response:  response,
		SessionID: fmt.Sprintf("pen_session_%d", time.Now().Unix()),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(chatResponse)
}

func (p *PenShopADK) handleCatalogue(w http.ResponseWriter, r *http.Request) {
	// Proxy to the pen catalogue service
	resp, err := http.Get(p.catalogueURL + "/catalogue")
	if err != nil {
		http.Error(w, "Catalogue service unavailable", http.StatusServiceUnavailable)
		return
	}
	defer resp.Body.Close()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(resp.StatusCode)
	
	// Copy response
	var products []PenProduct
	if err := json.NewDecoder(resp.Body).Decode(&products); err != nil {
		http.Error(w, "Invalid catalogue response", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(products)
}

func (p *PenShopADK) handleHealth(w http.ResponseWriter, r *http.Request) {
	status := map[string]string{
		"status":     "healthy",
		"service":    "pen-shop-adk",
		"catalogue":  p.catalogueURL,
		"mcp_gateway": p.mcpGateway,
	}
	
	// Check MongoDB connection
	if p.mongodb != nil {
		if err := p.mongodb.Ping(context.Background(), nil); err != nil {
			status["mongodb"] = "unhealthy"
		} else {
			status["mongodb"] = "healthy"
		}
	} else {
		status["mongodb"] = "not_connected"
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(status)
}

func main() {
	penShop, err := NewPenShopADK()
	if err != nil {
		log.Fatalf("Failed to initialize pen shop ADK: %v", err)
	}

	r := mux.NewRouter()
	
	// API routes
	r.HandleFunc("/api/chat", penShop.handleChat).Methods("POST")
	r.HandleFunc("/api/catalogue", penShop.handleCatalogue).Methods("GET")
	r.HandleFunc("/api/health", penShop.handleHealth).Methods("GET")

	// Configure CORS
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000", "http://localhost:9090"},
		AllowedMethods: []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders: []string{"*"},
	})

	handler := c.Handler(r)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	log.Printf("🖊️  Pen Shop ADK API starting on port %s", port)
	log.Printf("📦 Catalogue URL: %s", penShop.catalogueURL)
	log.Printf("🧠 MCP Gateway: %s", penShop.mcpGateway)
	log.Printf("API endpoints:")
	log.Printf("  POST /api/chat - Chat with AI assistant")
	log.Printf("  GET  /api/catalogue - Product catalogue proxy")
	log.Printf("  GET  /api/health - Health check")

	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
