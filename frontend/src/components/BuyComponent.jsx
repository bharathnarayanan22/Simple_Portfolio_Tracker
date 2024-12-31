// BuyComponent.js
import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, CircularProgress, Card, CardContent, CardMedia } from '@mui/material';

const BuyComponent = () => {
  const [loading, setLoading] = useState(false);
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    // Fetch stocks from an API or a mock function
    setStocks([
      { id: 1, name: "Stock 1", ticker: "STK1", price: 100 },
      { id: 2, name: "Stock 2", ticker: "STK2", price: 200 },
      { id: 3, name: "Stock 3", ticker: "STK3", price: 150 },
      // Add more stocks here
    ]);
  }, []);

  const handleBuyStock = (stock) => {
    setLoading(true);
    // API call to buy the stock, then update DB and state
    setTimeout(() => {
      setLoading(false);
      alert(`You bought ${stock.name} for $${stock.price}`);
    }, 1500);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Buy Stocks
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {stocks.map((stock) => (
            <Card key={stock.id} sx={{ width: '30%', textAlign: 'center', boxShadow: 5 }}>
              <CardMedia
                component="img"
                alt={stock.name}
                height="200"
                image={`https://via.placeholder.com/150`} // Replace with actual image URL if needed
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                  {stock.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ticker: {stock.ticker}
                </Typography>
                <Typography variant="h6" color="primary">
                  ${stock.price}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={() => handleBuyStock(stock)}
                >
                  Buy
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default BuyComponent;
