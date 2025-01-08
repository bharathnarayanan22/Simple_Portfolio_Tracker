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
  IconButton,
  Modal,
} from "@mui/material";
import { Star, StarBorder } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import FilterListIcon from "@mui/icons-material/FilterList";
import axios from "axios";
import PropTypes from "prop-types";
import buy from "../assets/buy.jpg";
import sell from "../assets/sell.webp";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const generateRandomPrice = (basePrice) => {
  const fluctuation = (Math.random() - 0.5) * 2;
  return Math.max(basePrice + fluctuation, 1);
};

const StocksManagementComponent = ({
  isBuying1,
  view1,
  setIsBuying1,
  setView1,
}) => {
  const [isBuying, setIsBuying] = useState(false);
  const [view, setView] = useState("cards");
  const [stocks, setStocks] = useState([]);
  const [ownedStocks, setOwnedStocks] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [funds, setFunds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [quantities, setQuantities] = useState({});
  const [portfolio, setPortfolio] = useState([]);
  const userId = localStorage.getItem("userId");
  const [openModal, setOpenModal] = useState(false);
  const [quantityToSell, setQuantityToSell] = useState(0);
  const [selectedStock, setSelectedStock] = useState(null);

  const handleBackClick = () => {
    setIsBuying1(false);
    setView1("cards");
    setView("cards");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fundsResponse = await axios.get(
          `https://simple-portfolio-tracker-1-durb.onrender.com/api/users/${userId}/funds`
        );
        setFunds(fundsResponse.data);

        const stocksResponse = await axios.get("https://simple-portfolio-tracker-1-durb.onrender.com/stocks");
        const initialStocks = stocksResponse.data.map((stock) => ({
          ...stock,
          price: generateRandomPrice(stock.price || 100), // Add initial price if not present
        }));
        setStocks(initialStocks);

        const ownedStocksResponse = await axios.get(
          `https://simple-portfolio-tracker-1-durb.onrender.com/api/users/${userId}/stocks`
        );
        setOwnedStocks(ownedStocksResponse.data);

        const response = await axios.get(
          `https://simple-portfolio-tracker-1-durb.onrender.com/api/users/${userId}/portfolio`
        );
        const portfolioData = response.data;

        const updatedData = portfolioData.map((stock) => ({
          ...stock,
          currentPrice: stock.purchasePrice * (1 + Math.random() * 0.2 - 0.1),
        }));

        setPortfolio(updatedData);

        const watchlistResponse = await axios.get(
          `https://simple-portfolio-tracker-1-durb.onrender.com/api/users/${userId}/watchlist`
        );
        setWatchlist(watchlistResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [funds, userId]);

  useEffect(() => {
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
        await axios.post(`https://simple-portfolio-tracker-1-durb.onrender.com/api/users/${userId}/buyStock`, {
          stockName: stock.stock_name,
          ticker: stock.ticker,
          price: stock.price,
          quantity,
        });
        setFunds(funds - totalCost);
        toast.success(
          `You bought ${quantity} of ${stock.name} for $${totalCost.toFixed(2)}`
        );
      } catch (error) {
        console.error("Error buying stock:", error);
        toast.error("Failed to complete the purchase.");
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Not enough funds to complete this purchase.");
    }
  };

  const handleAddToWatchlist = async (stock) => {
    try {
      await axios.post(`https://simple-portfolio-tracker-1-durb.onrender.com/api/users/${userId}/watchlist`, {
        stockId: stock.id,
      });
      setWatchlist((prev) => [...prev, stock.id]);
      toast.success("Stock added to watchlist!");
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      toast.error("Failed to add stock to watchlist.");
    }
  };

  const handleRemoveFromWatchlist = async (stockId) => {
    try {
      await axios.delete(
        `https://simple-portfolio-tracker-1-durb.onrender.com/api/users/${userId}/watchlist`,
        {
          data: { stockId },
        }
      );
      setWatchlist((prev) => prev.filter((id) => id !== stockId));
      toast.success("Stock removed from watchlist!");
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      toast.error("Failed to remove stock from watchlist.");
    }
  };

  const handleSellClick = (stock) => {
    setSelectedStock(stock);
    setOpenModal(true); 
  };

  const handleSell = async () => {
    const ownedQuantity =
      ownedStocks.find((s) => s.id === selectedStock.id)?.quantity || 0;

    if (quantityToSell > 0 && quantityToSell <= ownedQuantity) {
      const totalValue = selectedStock.purchasePrice * quantityToSell;

      setLoading(true);
      try {
        await axios.post(
          `https://simple-portfolio-tracker-1-durb.onrender.com/api/users/${userId}/sellStock`,
          {
            stockId: selectedStock.id,
            quantity: quantityToSell,
          }
        );
        setFunds(funds + totalValue);

        const updatedPortfolio = portfolio
          .map((stock) => {
            if (stock.id === selectedStock.id) {
              const updatedStock = {
                ...stock,
                quantity: stock.quantity - quantityToSell,
              };
              return updatedStock.quantity === 0 ? null : updatedStock;
            }
            return stock;
          })
          .filter(Boolean);

        setPortfolio(updatedPortfolio);

        toast.success(`Stock sold successfully for $${totalValue.toFixed(2)}`);
      } catch (error) {
        console.error("Error selling stock:", error);
        toast.error("Failed to sell stock.");
      } finally {
        setLoading(false);
        setOpenModal(false); 
        setQuantityToSell(0); 
      }
    } else {
      alert("Invalid quantity for selling. Please enter a valid amount.");
    }
  };

  const toggleWatchlist = (stock) => {
    if (watchlist.includes(stock.id)) {
      handleRemoveFromWatchlist(stock.id);
    } else {
      handleAddToWatchlist(stock);
    }
  };

  const filteredStocks =
    isBuying || isBuying1
      ? stocks.filter(
          (stock) =>
            stock.stock_name.toLowerCase().includes(search.toLowerCase()) &&
            stock.price >= priceRange[0] &&
            stock.price <= priceRange[1]
        )
      : portfolio.map((ownedStock) => ({
          ...ownedStock, 
          price: generateRandomPrice(ownedStock.purchase_price), 
        }));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {view === "cards" && view1 === "cards" && (
        <Box sx={{ display: "flex", gap: 4, justifyContent: "center", mt: 8 }}>
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
              image= {buy}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Buy Stocks
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Get started with buying stocks. View real-time stock prices and
                make your investments!
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
              image={sell}
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

      {(view === "stocks" || view1 === "stocks") && (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                color: "primary.main", 
                mb: 2,
              }}
            >
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
              {(isBuying || isBuying1) && (
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

            <ToastContainer />
          </Box>

          {isBuying || isBuying1 ? (
            <TableContainer component={Paper} sx={{ mb: 4 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "primary.main" }}>
                    <TableCell sx={{ color: "white" }}>
                      <strong>Stock Name</strong>
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      <strong>Ticker</strong>
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      <strong>Price</strong>
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      <strong>Volume</strong>
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      <strong>Quantity</strong>
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      <strong>Actions</strong>
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      <strong>Watchlist</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStocks.map((stock) => (
                    <TableRow
                      key={stock.id}
                      sx={{
                        "&:nth-of-type(odd)": {
                          backgroundColor: (theme) =>
                            theme.palette.action.hover,
                        },
                        "&:hover": {
                          backgroundColor: (theme) =>
                            theme.palette.action.selected,
                          cursor: "pointer",
                        },
                      }}
                    >
                      <TableCell>{stock.stock_name}</TableCell>
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
                      <TableCell>
                        <IconButton
                          onClick={() => toggleWatchlist(stock)}
                          color="inherit"
                          aria-label="Add to Watchlist"
                        >
                          {watchlist.includes(stock.id) ? (
                            <Star sx={{ color: "gold" }} />
                          ) : (
                            <StarBorder />
                          )}
                        </IconButton>
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
                  <TableRow sx={{ backgroundColor: "primary.main" }}>
                    <TableCell sx={{ color: "white" }}>
                      <strong>Stock Name</strong>
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      <strong>Ticker</strong>
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      <strong>Quantity</strong>
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      <strong>Purchased Price</strong>
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      <strong>Current Price</strong>
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      <strong>Total Value</strong>
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      <strong>Profit/Loss</strong>
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      <strong>Actions</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {portfolio.map((stock) => (
                    <TableRow
                      key={stock.id}
                      sx={{
                        "&:nth-of-type(odd)": {
                          backgroundColor: (theme) =>
                            theme.palette.action.hover,
                        },
                        "&:hover": {
                          backgroundColor: (theme) =>
                            theme.palette.action.selected,
                          cursor: "pointer",
                        },
                      }}
                    >
                      <TableCell>{stock.stockName}</TableCell>
                      <TableCell>{stock.ticker}</TableCell>
                      <TableCell>{stock.quantity}</TableCell>
                      <TableCell>${stock.purchasePrice.toFixed(2)}</TableCell>
                      <TableCell>${stock.currentPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        ${(stock.currentPrice * stock.quantity).toFixed(2)}
                      </TableCell>
                      <TableCell
                        style={{
                          color:
                            stock.currentPrice >= stock.purchasePrice
                              ? "green"
                              : "red",
                        }}
                      >
                        $
                        {(
                          (stock.currentPrice - stock.purchasePrice) *
                          stock.quantity
                        ).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => handleSellClick(stock)}
                          disabled={loading || stock.quantity === 0}
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
            onClick={handleBackClick}
            sx={{ mt: 2 }}
          >
            Back
          </Button>

          {/* Modal for Quantity Input */}
          <Modal open={openModal} onClose={() => setOpenModal(false)}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 300,
                bgcolor: "background.paper",
                boxShadow: 24,
                p: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Enter Quantity to Sell
              </Typography>
              <TextField
                label="Quantity"
                type="number"
                value={quantityToSell}
                onChange={(e) => setQuantityToSell(Number(e.target.value))}
                fullWidth
                margin="normal"
                InputProps={{
                  inputProps: {
                    min: 1,
                    max: selectedStock?.quantity,
                  },
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSell}
                fullWidth
              >
                Confirm Sell
              </Button>
            </Box>
          </Modal>
        </>
      )}
    </Container>
  );
};

StocksManagementComponent.propTypes = {
  isBuying1: PropTypes.bool.isRequired,
  view1: PropTypes.oneOf(["cards", "stocks"]).isRequired,
  setIsBuying1: PropTypes.func.isRequired,
  setView1: PropTypes.func.isRequired,
};

export default StocksManagementComponent;
