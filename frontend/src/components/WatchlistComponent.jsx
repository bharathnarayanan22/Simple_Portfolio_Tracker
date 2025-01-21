import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  CircularProgress,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CardActions,
  Chip,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
  Divider,
  Tooltip,
  IconButton,
  InputAdornment,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Undo, ShoppingCart } from "@mui/icons-material";
import StarIcon from "@mui/icons-material/Star";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MoneyIcon from "@mui/icons-material/Money";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

const WatchlistComponent = () => {
  const [stockIds, setStockIds] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const userId = localStorage.getItem("userId");
  const [filteredStocks, setFilteredStocks] = useState([]);

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const response = await axios.get(
          `https://simple-portfolio-tracker-1-durb.onrender.com/api/users/${userId}/watchlist`
        );
        setStockIds(response.data);
      } catch (err) {
        setError("Failed to fetch watchlist");
      }
    };

    fetchWatchlist();
  }, []);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const stockDetails = await Promise.all(
          stockIds.map((id) => axios.get(`https://simple-portfolio-tracker-1-durb.onrender.com/stocks/${id}`))
        );
        const enrichedStocks = stockDetails.map((response) => {
          const stock = response.data;
          const currentPrice = stock.price
            ? stock.price * (1 + (Math.random() * 0.2 - 0.1))
            : null;
          return {
            ...stock,
            currentPrice,
          };
        });
        setStocks(enrichedStocks);
        setFilteredStocks(enrichedStocks);
      } catch (err) {
        setError("Failed to fetch stock details");
      } finally {
        setLoading(false);
      }
    };

    if (stockIds.length > 0) {
      fetchStocks();
    }
  }, [stockIds]);

  // Filtering Handlers
  const handleSearch = (searchValue) => {
    const filtered = stocks.filter((stock) =>
      stock.stock_name.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredStocks(filtered);
  };

  const handleSortByPrice = () => {
    const sorted = [...filteredStocks].sort(
      (a, b) => b.currentPrice - a.currentPrice
    );
    setFilteredStocks(sorted);
  };

  const handleFilterIncrease = () => {
    const gainers = stocks.filter((stock) => stock.currentPrice > stock.price);
    setFilteredStocks(gainers);
  };

  const handleFilterDecrease = () => {
    const losers = stocks.filter((stock) => stock.currentPrice <= stock.price);
    setFilteredStocks(losers);
  };

  const resetFilters = () => {
    setFilteredStocks(stocks);
  };

  const handleOpenBuyDialog = (stock) => {
    setSelectedStock(stock);
    setQuantity(1);
    setBuyDialogOpen(true);
  };

  const handleBuy = async () => {
    if (!selectedStock) return;

    const totalCost = selectedStock.price * quantity;

    try {
      setLoading(true);
      await axios.post(`https://simple-portfolio-tracker-1-durb.onrender.com/api/users/${userId}/buyStock`, {
        stockName: selectedStock.stock_name,
        ticker: selectedStock.ticker,
        price: selectedStock.price,
        quantity,
      });
      toast.success(
        `You bought ${quantity} of ${
          selectedStock.stock_name
        } for $${totalCost.toFixed(2)}`
      );
    } catch (error) {
      console.error("Error buying stock:", error);
      alert("Failed to complete the transaction.");
    } finally {
      setLoading(false);
      setBuyDialogOpen(false);
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
      setStockIds((prev) => prev.filter((id) => id !== stockId));
      toast.success("Stock removed from watchlist!");
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      toast.error("Error removing the stock:", error);
    }
  };

  if (loading) {
    return (
      <Box p={4}>
        <Typography
          variant="h4"
          sx={{
            display: "flex",
            alignItems: "center",
            fontWeight: "bold",
            fontFamily: "'Poppins', sans-serif",
            letterSpacing: 1.5,
            textTransform: "uppercase",
            background: "linear-gradient(90deg, #6A5ACD, #00BFFF)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.4)",
            mb: "3%",
          }}
        >
          <StarIcon sx={{ mr: 1, fontSize: "2rem", color: "#FFD700" }} />{" "}
          Watchlist
        </Typography>
        <Grid container spacing={3}>
          {Array.from(new Array(6)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton
                variant="rectangular"
                height={200}
                animation="wave"
                sx={{ borderRadius: 2 }}
              />
              <Skeleton variant="text" />
              <Skeleton variant="text" />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            display: "flex",
            alignItems: "center",
            fontWeight: "bold",
            fontFamily: "'Poppins', sans-serif",
            letterSpacing: 1.5,
            textTransform: "uppercase",
            background: "linear-gradient(90deg, #6A5ACD, #00BFFF)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.4)",
          }}
        >
          <StarIcon sx={{ mr: 1, fontSize: "2rem", color: "#FFD700" }} />{" "}
          Watchlist
        </Typography>

        {/* Filter Section */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
          }}
        >
          <TextField
            label="Search by Name"
            variant="outlined"
            size="small"
            onChange={(e) => handleSearch(e.target.value)}
            sx={{ width: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <Tooltip title="Sort by Price">
            <IconButton
              size="small"
              onClick={handleSortByPrice}
              sx={{
                color: "primary.main", // Default icon color
                "&:hover": {
                  color: "secondary.main", // Hover color
                },
              }}
            >
              <SortIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Filter Increase">
            <IconButton
              size="small"
              onClick={handleFilterIncrease}
              sx={{
                color: "error.main",
                "&:hover": {
                  color: "warning.main",
                },
              }}
            >
              <ArrowUpwardIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Filter Decrease">
            <IconButton
              size="small"
              onClick={handleFilterDecrease}
              sx={{
                color: "success.main",
                "&:hover": {
                  color: "warning.main",
                },
              }}
            >
              <ArrowDownwardIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Reset Filters">
            <IconButton
              size="small"
              color="secondary"
              onClick={resetFilters}
              sx={{
                color: "secondary.main",
                "&:hover": {
                  color: "primary.main",
                },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {loading
          ? Array.from(new Array(6)).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Skeleton
                  variant="rectangular"
                  height={200}
                  animation="wave"
                  sx={{ borderRadius: 2 }}
                />
                <Skeleton variant="text" />
                <Skeleton variant="text" />
              </Grid>
            ))
          : filteredStocks.map((stock) => (
              <Grid item xs={12} sm={6} md={4} key={stock.id}>
                <Card
                  sx={{
                    boxShadow: 3,
                    borderRadius: 2,
                    overflow: "hidden",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "0.3s",
                    "&:hover": { boxShadow: 6, transform: "translateY(-5px)" },
                  }}
                >
                  {/* Header Segment */}
                  <Box
                    sx={{
                      background: "linear-gradient(135deg, #6A11CB, #2575FC)",
                      color: "white",
                      padding: "10px 16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "bold", fontSize: "1.1rem" }}
                    >
                      {stock.stock_name}
                    </Typography>
                    <Chip
                      label={`Ticker: ${stock.ticker}`}
                      sx={{
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    />
                  </Box>

                  {/* Content Segment */}
                  <CardContent
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      background:
                        "linear-gradient(135deg, rgb(255, 255, 255), rgb(227, 242, 255))",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        alignItems: "flex-start",
                        gap: 1.5,
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: "1rem",
                          fontWeight: 500,
                        }}
                      >
                        Price at Addition: ${stock.price?.toFixed(2) || "N/A"}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color:
                            stock.currentPrice <= stock.price ? "green" : "red",
                          fontWeight: "bold",
                          fontSize: "1rem",
                        }}
                      >
                        Current Price: $
                        {stock.currentPrice?.toFixed(2) || "N/A"}
                      </Typography>
                      <Chip
                        icon={
                          stock.currentPrice > stock.price ? (
                            <TrendingUpIcon sx={{ color: "green" }} />
                          ) : (
                            <TrendingDownIcon sx={{ color: "red" }} />
                          )
                        }
                        label={`Dividend: ${
                          (stock.currentPrice - stock.price)?.toFixed(2) ||
                          "N/A"
                        }`}
                        sx={{
                          backgroundColor:
                            stock.currentPrice <= stock.price
                              ? "rgba(76, 175, 80, 0.1)"
                              : "rgba(244, 67, 54, 0.1)",
                          color:
                            stock.currentPrice <= stock.price ? "green" : "red",
                          fontWeight: "bold",
                          fontSize: "0.9rem",
                          padding: "5px 10px",
                        }}
                      />
                    </Box>
                  </CardContent>

                  {/* Actions Segment */}
                  <CardActions
                    sx={{
                      justifyContent: "space-between",
                      padding: "8px 16px",
                      background:
                        "linear-gradient(135deg, rgb(255, 255, 255), rgb(227, 242, 255))",
                    }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<ShoppingCart />}
                      onClick={() => handleOpenBuyDialog(stock)}
                      sx={{
                        "&:hover": {
                          backgroundColor: "white",
                          color:
                            stock.currentPrice <= stock.price
                              ? "rgb(76, 175, 80)"
                              : "rgb(244, 67, 54)",
                          border: `1px solid ${
                            stock.currentPrice <= stock.price
                              ? "rgb(76, 175, 80)"
                              : "rgb(244, 67, 54)"
                          }`,
                        },
                        backgroundColor:
                          stock.currentPrice <= stock.price
                            ? "rgb(76, 175, 80)"
                            : "rgb(244, 67, 54)",
                        color: "white",
                        fontWeight: "bold",
                        borderRadius: 2,
                      }}
                    >
                      Buy
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Undo />}
                      onClick={() => handleRemoveFromWatchlist(stock.id)}
                      sx={{
                        "&:hover": {
                          backgroundColor: "rgb(252, 17, 0)",
                          cursor: "pointer",
                        },
                      }}
                    >
                      Remove
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
      </Grid>
      {stocks.length === 0 && (
        <Typography variant="h6" textAlign="center" mt={4}>
          No stocks in your watchlist.
        </Typography>
      )}
      <Dialog
        open={buyDialogOpen}
        onClose={() => setBuyDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            boxShadow: 10,
            background: "linear-gradient(135deg, #ffffff, #f0f0f0)",
            padding: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#013d79",
            textAlign: "center",
            background: "linear-gradient(to right, #013d79, #0148a3)",
            borderRadius: "8px 8px 0 0",
            padding: 2,
          }}
        >
          Buy Stock
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", mt: 2 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: "#013d79",
              mb: 2,
              fontSize: "1.2rem",
            }}
          >
            {selectedStock?.stock_name} ({selectedStock?.ticker})
          </Typography>
          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            fullWidth
            margin="normal"
            InputProps={{
              sx: {
                borderRadius: "8px",
                "& input": { color: "#013d79" },
              },
            }}
            InputLabelProps={{
              sx: {
                color: "#0148a3",
              },
            }}
          />
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "space-around",
            mt: 2,
            pb: 2,
          }}
        >
          <Button
            onClick={() => setBuyDialogOpen(false)}
            sx={{
              background: "linear-gradient(to right, #e74c3c, #c0392b)",
              color: "#fff",
              fontWeight: 700,
              px: 3,
              py: 1,
              "&:hover": {
                background: "linear-gradient(to right, #c0392b, #e74c3c)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBuy}
            sx={{
              background: "linear-gradient(to right, #2ecc71, #27ae60)",
              color: "#fff",
              fontWeight: 700,
              px: 3,
              py: 1,
              "&:hover": {
                background: "linear-gradient(to right, #27ae60, #2ecc71)",
              },
            }}
          >
            Buy
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </Box>
  );
};

export default WatchlistComponent;
