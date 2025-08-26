package utils

import (
	"log"
	"pen-shop/models"
)

// SimpleLogger implements the Logger interface
type SimpleLogger struct {
	prefix string
}

func NewLogger(prefix string) models.Logger {
	return &SimpleLogger{prefix: prefix}
}

func (sl *SimpleLogger) Info(msg string, args ...interface{}) {
	log.Printf("[INFO] [%s] "+msg, append([]interface{}{sl.prefix}, args...)...)
}

func (sl *SimpleLogger) Error(msg string, args ...interface{}) {
	log.Printf("[ERROR] [%s] "+msg, append([]interface{}{sl.prefix}, args...)...)
}

func (sl *SimpleLogger) Debug(msg string, args ...interface{}) {
	log.Printf("[DEBUG] [%s] "+msg, append([]interface{}{sl.prefix}, args...)...)
}
