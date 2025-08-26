package models

import (
	"context"
	"time"
)

// Query represents a user query with context
type Query struct {
	ID       string                 `json:"id"`
	Content  string                 `json:"content"`
	UserID   string                 `json:"user_id"`
	Context  map[string]interface{} `json:"context"`
	Priority int                    `json:"priority"`
}

// Response represents an agent response
type Response struct {
	AgentName  string                 `json:"agent_name"`
	Content    string                 `json:"content"`
	Confidence float64                `json:"confidence"`
	Metadata   map[string]interface{} `json:"metadata"`
	Timestamp  time.Time              `json:"timestamp"`
}

// Agent interface for all agents
type Agent interface {
	GetName() string
	GetCapabilities() []string
	CanHandle(query Query) float64
	Process(ctx context.Context, query Query) (Response, error)
	GetPriority() int
}

// Logger interface
type Logger interface {
	Info(msg string, args ...interface{})
	Error(msg string, args ...interface{})
	Debug(msg string, args ...interface{})
}
