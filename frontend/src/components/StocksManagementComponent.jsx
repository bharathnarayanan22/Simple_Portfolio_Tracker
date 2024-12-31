import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  CircularProgress,
  TextField,
  TableContainer,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import axios from "axios";

const generateRandomPrice = (basePrice) => {
  const fluctuation = (Math.random() - 0.5) * 2;
  return Math.max(basePrice + fluctuation, 1);
};

const StocksManagementComponent = () => {
  const [isBuying, setIsBuying] = useState(true); // To control Buy/Sell toggle
  const [view, setView] = useState("cards"); // To control current view
  const [stocks, setStocks] = useState([]);
  const [ownedStocks, setOwnedStocks] = useState([]);
  const [funds, setFunds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [quantities, setQuantities] = useState({});
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch funds
        const fundsResponse = await axios.get(`http://localhost:8080/api/users/${userId}/funds`);
        setFunds(fundsResponse.data);

        // Generate available stocks (mock data)
        const initialStocks = Array.from({ length: 20 }, (_, index) => ({
          id: index + 1,
          stockName: `Stock ${index + 1}`,
          ticker: `STK${index + 1}`,
          price: generateRandomPrice(100),
          volume: Math.floor(Math.random() * 10000) + 1000,
        }));
        setStocks(initialStocks);

        // Fetch user-owned stocks (mock endpoint)
        const ownedStocksResponse = await axios.get(
          `http://localhost:8080/api/users/${userId}/stocks`
        );
        setOwnedStocks(ownedStocksResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [funds, userId]);

  useEffect(() => {
    // Update stock prices every 5 seconds
    const interval = setInterval(() => {
      setStocks((prevStocks) =>
        prevStocks.map((stock) => ({
          ...stock,
          price: generateRandomPrice(stock.price),
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleBuy = async (stock) => {
    const quantity = quantities[stock.id] || 1;
    const totalCost = stock.price * quantity;

    if (funds >= totalCost) {
      setLoading(true);
      try {
        await axios.post(`http://localhost:8080/api/users/${userId}/buyStock`, {
          stockName: stock.stockName,
          ticker: stock.ticker,
          price: stock.price,
          quantity,
        });
        setFunds(funds - totalCost);
        alert(`You bought ${quantity} of ${stock.name} for $${totalCost.toFixed(2)}`);
      } catch (error) {
        console.error("Error buying stock:", error);
        alert("Failed to complete the transaction.");
      } finally {
        setLoading(false);
      }
    } else {
      alert("Not enough funds to complete this purchase.");
    }
  };

  const handleSell = async (stock) => {
    const quantity = quantities[stock.id] || 1;
    const totalValue = stock.purchasePrice * quantity;
    const ownedQuantity = ownedStocks.find((s) => s.id === stock.id)?.quantity || 0;

    if (quantity > 0 && quantity <= ownedQuantity) {
      setLoading(true);
      try {
        await axios.post(`http://localhost:8080/api/users/${userId}/sellStock`, {
          stockId: stock.id,
          quantity,
        });
        setFunds(funds + totalValue);
        alert(`You sold ${quantity} of ${stock.name} for $${totalValue.toFixed(2)}`);
      } catch (error) {
        console.error("Error selling stock:", error);
        alert("Failed to complete the transaction.");
      } finally {
        setLoading(false);
      }
    } else {
      alert("Invalid quantity for selling.");
    }
  };

  const filteredStocks = isBuying
    ? stocks.filter(
        (stock) =>
          stock.stockName.toLowerCase().includes(search.toLowerCase()) &&
          stock.price >= priceRange[0] &&
          stock.price <= priceRange[1]
      )
    : ownedStocks.map((ownedStock) => ({
        ...ownedStock, // Keep all properties from ownedStock
        price: generateRandomPrice(ownedStock.purchasePrice), // Simulate price fluctuation
      }));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {view === "cards" && (
        <Box sx={{ display: "flex", gap: 4, justifyContent: "center", mb: 4 }}>
          <Card
            sx={{
              width: "45%",
              textAlign: "center",
              boxShadow: 5,
              transition: "transform 0.3s",
              "&:hover": { transform: "scale(1.05)" },
            }}
          >
            <CardMedia
              component="img"
              alt="Buy Stocks Image"
              height="200"
              image="src/assets/buy.jpg"
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Buy Stocks
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Get started with buying stocks. View real-time stock prices
                and make your investments!
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setIsBuying(true);
                  setView("stocks");
                }}
                sx={{ mt: 2 }}
              >
                Buy Stocks
              </Button>
            </CardContent>
          </Card>

          <Card
            sx={{
              width: "45%",
              textAlign: "center",
              boxShadow: 5,
              transition: "transform 0.3s",
              "&:hover": { transform: "scale(1.05)" },
            }}
          >
            <CardMedia
              component="img"
              alt="Sell Stocks Image"
              height="200"
              image="src/assets/sell.jpg"
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Sell Stocks
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your portfolio by selling stocks. Monitor market trends
                and make informed decisions!
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  setIsBuying(false);
                  setView("stocks");
                }}
                sx={{ mt: 2 }}
              >
                Sell Stocks
              </Button>
            </CardContent>
          </Card>
        </Box>
      )}

      {view === "stocks" && (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Available Funds: ${funds.toFixed(2)}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
              <TextField
                label="Search Stocks"
                variant="outlined"
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
              />
              {isBuying && (
                <>
                  <TextField
                    label="Min Price"
                    variant="outlined"
                    size="small"
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([Number(e.target.value), priceRange[1]])
                    }
                    sx={{ width: "150px" }}
                  />
                  <TextField
                    label="Max Price"
                    variant="outlined"
                    size="small"
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], Number(e.target.value)])
                    }
                    sx={{ width: "150px" }}
                  />
                </>
              )}
            </Box>
          </Box>

          {isBuying ? (
            <TableContainer component={Paper} sx={{ mb: 4 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white' }}><strong>Stock Name</strong></TableCell>
                    <TableCell sx={{ color: 'white' }}><strong>Ticker</strong></TableCell>
                    <TableCell sx={{ color: 'white' }}><strong>Price</strong></TableCell>
                    <TableCell sx={{ color: 'white' }}><strong>Volume</strong></TableCell>
                    <TableCell sx={{ color: 'white' }}><strong>Quantity</strong></TableCell>
                    <TableCell sx={{ color: 'white' }}><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStocks.map((stock) => (
                    <TableRow key={stock.id}>
                      <TableCell>{stock.stockName}</TableCell>
                      <TableCell>{stock.ticker}</TableCell>
                      <TableCell>${stock.price}</TableCell>
                      <TableCell>{stock.volume}</TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={quantities[stock.id] || 1}
                          onChange={(e) =>
                            setQuantities({
                              ...quantities,
                              [stock.id]: Math.max(Number(e.target.value), 1),
                            })
                          }
                          sx={{ width: 80 }}
                          inputProps={{ min: 1 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleBuy(stock)}
                          disabled={loading || funds < stock.price}
                        >
                          {loading ? <CircularProgress size={24} /> : "Buy"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <TableContainer component={Paper} sx={{ mb: 4 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white' }}><strong>Stock Name</strong></TableCell>
                    <TableCell sx={{ color: 'white' }}><strong>Ticker</strong></TableCell>
                    <TableCell sx={{ color: 'white' }}><strong>Price</strong></TableCell>
                    <TableCell sx={{ color: 'white' }}><strong>Volume</strong></TableCell>
                    <TableCell sx={{ color: 'white' }}><strong>Owned Quantity</strong></TableCell>
                    <TableCell sx={{ color: 'white' }}><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ownedStocks.map((stock) => (
                    <TableRow key={stock.id}>
                      <TableCell>{stock.stockName}</TableCell>
                      <TableCell>{stock.ticker}</TableCell>
                      <TableCell>${generateRandomPrice(stock.purchasePrice)}</TableCell>
                      <TableCell>{stock.volume}</TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={quantities[stock.id] || 1}
                          onChange={(e) =>
                            setQuantities({
                              ...quantities,
                              [stock.id]: Math.max(Number(e.target.value), 1),
                            })
                          }
                          sx={{ width: 80 }}
                          inputProps={{ min: 1 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => handleSell(stock)}
                          disabled={loading}
                        >
                          {loading ? <CircularProgress size={24} /> : "Sell"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Button
            variant="outlined"
            color="primary"
            onClick={() => setView("cards")}
            sx={{ mt: 2 }}
          >
            Back
          </Button>
        </>
      )}
    </Container>
  );
};

export default StocksManagementComponent;
