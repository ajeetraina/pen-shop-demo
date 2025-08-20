import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const Header = styled.div`
  background: rgba(0,0,0,0.2);
  color: white;
  padding: 20px;
  text-align: center;
`;

const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 800px;
  margin: 20px auto;
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
`;

const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

const Message = styled.div`
  margin-bottom: 15px;
  padding: 12px 16px;
  border-radius: 12px;
  max-width: 80%;
  
  ${props => props.isUser ? `
    background: #3498db;
    color: white;
    margin-left: auto;
  ` : `
    background: #f1f2f6;
    color: #333;
  `}
`;

const InputArea = styled.div`
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #ddd;
  border-radius: 25px;
  outline: none;
  
  &:focus {
    border-color: #3498db;
  }
`;

const SendButton = styled.button`
  padding: 12px 24px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  
  &:hover {
    background: #2980b9;
  }
  
  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }
`;

function App() {
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm your AI pen expert. I can help you find the perfect writing instrument, compare brands, or answer any questions about our luxury pen collection. What can I help you with today?",
      isUser: false,
      id: 1
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      text: inputValue.trim(),
      isUser: true,
      id: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
      const response = await axios.post(`${apiUrl}/api/chat`, {
        message: userMessage.text
      });

      const botMessage = {
        text: response.data.response,
        isUser: false,
        id: Date.now() + 1
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        text: "I apologize, but I'm having trouble connecting right now. Please try again.",
        isUser: false,
        id: Date.now() + 1
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <AppContainer>
      <Header>
        <h1>🖊️ Pen Shop AI Assistant</h1>
        <p>Expert advice for luxury writing instruments</p>
      </Header>
      <ChatContainer>
        <MessagesArea>
          {messages.map(message => (
            <Message key={message.id} isUser={message.isUser}>
              {message.text}
            </Message>
          ))}
          {isLoading && (
            <Message isUser={false}>
              <em>AI assistant is thinking...</em>
            </Message>
          )}
        </MessagesArea>
        <InputArea>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about pens, brands, recommendations..."
            disabled={isLoading}
          />
          <SendButton 
            onClick={sendMessage}
            disabled={isLoading || !inputValue.trim()}
          >
            Send
          </SendButton>
        </InputArea>
      </ChatContainer>
    </AppContainer>
  );
}

export default App;
