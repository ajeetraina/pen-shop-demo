import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const Header = styled.header`
  background: rgba(0,0,0,0.1);
  padding: 20px 0;
  text-align: center;
  color: white;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 3em;
  font-weight: 300;
`;

const Subtitle = styled.p`
  margin: 10px 0 0 0;
  font-size: 1.2em;
  opacity: 0.9;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 40px;
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const ProductName = styled.h3`
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 1.3em;
`;

const ProductBrand = styled.p`
  margin: 0 0 10px 0;
  color: #7f8c8d;
  font-weight: 500;
`;

const ProductPrice = styled.div`
  font-size: 1.5em;
  font-weight: bold;
  color: #27ae60;
  margin-bottom: 15px;
`;

const ProductDescription = styled.p`
  color: #666;
  line-height: 1.5;
  margin-bottom: 20px;
`;

const StockStatus = styled.span`
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.9em;
  font-weight: 500;
  
  ${props => props.inStock ? `
    background: #d4edda;
    color: #155724;
  ` : `
    background: #f8d7da;
    color: #721c24;
  `}
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: white;
  font-size: 1.2em;
  margin-top: 50px;
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: #e74c3c;
  background: white;
  padding: 20px;
  border-radius: 10px;
  margin-top: 50px;
`;

const AIButton = styled.button`
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 50px;
  padding: 15px 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.4);
  transition: all 0.3s ease;
  
  &:hover {
    background: #2980b9;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(52, 152, 219, 0.6);
  }
`;

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const catalogueUrl = process.env.REACT_APP_CATALOGUE_URL || 'http://localhost:8081';
        const response = await axios.get(`${catalogueUrl}/catalogue`);
        setProducts(response.data);
      } catch (err) {
        setError('Unable to load pen catalogue. Please try again later.');
        console.error('Catalogue error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const openAIAssistant = () => {
    window.open('http://localhost:3000', '_blank');
  };

  if (loading) {
    return (
      <AppContainer>
        <Header>
          <Title>🖊️ Luxury Pen Shop</Title>
          <Subtitle>Premium Writing Instruments</Subtitle>
        </Header>
        <Container>
          <LoadingMessage>Loading our exquisite pen collection...</LoadingMessage>
        </Container>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <Header>
        <Title>🖊️ Luxury Pen Shop</Title>
        <Subtitle>Premium Writing Instruments</Subtitle>
      </Header>
      <Container>
        {error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : (
          <ProductGrid>
            {products.map(pen => (
              <ProductCard key={pen.id}>
                <ProductName>{pen.name}</ProductName>
                <ProductBrand>{pen.brand} - {pen.type}</ProductBrand>
                <ProductPrice>${pen.price.toFixed(2)}</ProductPrice>
                <ProductDescription>{pen.description}</ProductDescription>
                <StockStatus inStock={pen.in_stock}>
                  {pen.in_stock ? '✅ In Stock' : '❌ Out of Stock'}
                </StockStatus>
              </ProductCard>
            ))}
          </ProductGrid>
        )}
      </Container>
      <AIButton onClick={openAIAssistant}>
        💬 Chat with AI Pen Expert
      </AIButton>
    </AppContainer>
  );
}

export default App;
