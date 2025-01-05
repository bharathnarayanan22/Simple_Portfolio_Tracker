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
} from "@mui/material";
import { Undo, ShoppingCart } from "@mui/icons-material";

const WatchlistComponent = () => {
    const [stockIds, setStockIds] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [buyDialogOpen, setBuyDialogOpen] = useState(false);
    const [selectedStock, setSelectedStock] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        const fetchWatchlist = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/users/${userId}/watchlist`);
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
                    stockIds.map((id) => axios.get(`http://localhost:8080/stocks/${id}`))
                );
                const enrichedStocks = stockDetails.map((response) => {
                    const stock = response.data;
                    const currentPrice = stock.price
                        ? stock.price * (1 + (Math.random() * 0.2 - 0.1)) // Simulate price change
                        : null;
                    return {
                        ...stock,
                        currentPrice,
                    };
                });
                setStocks(enrichedStocks);
            } catch (err) {
                setError("Failed to fetch stock details");
            } finally {
                setLoading(false);
            }
        };

        if (stockIds.length > 0) {
            fetchStocks();
        } else {
            setLoading(false);
        }
    }, [stockIds]);

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
            await axios.post(`http://localhost:8080/api/users/${userId}/buyStock`, {
                stockName: selectedStock.stock_name,
                ticker: selectedStock.ticker,
                price: selectedStock.price,
                quantity,
            });
            alert(`You bought ${quantity} of ${selectedStock.stock_name} for $${totalCost.toFixed(2)}`);
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
            await axios.delete(`http://localhost:8080/api/users/${userId}/watchlist`, {
                data: { stockId },
            });
            setStockIds((prev) => prev.filter((id) => id !== stockId));
            alert("Stock removed from watchlist!");
        } catch (error) {
            console.error("Error removing from watchlist:", error);
            alert("Failed to remove stock from watchlist.");
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
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
            <Typography variant="h4" gutterBottom textAlign="center" fontWeight="bold">
                Watchlist
            </Typography>
            <Grid container spacing={3}>
                {stocks.map((stock) => (
                    <Grid item xs={12} sm={6} md={4} key={stock.id}>
                        <Card
                            sx={{
                                boxShadow: 3,
                                borderRadius: 2,
                                background: "linear-gradient(135deg, #ffffff, #f0f8ff)",
                                overflow: "hidden",
                            }}
                        >
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: "bold", color: "#3f51b5" }}
                                >
                                    {stock.stock_name}
                                </Typography>
                                <Typography variant="subtitle1" color="textSecondary">
                                    Ticker: {stock.ticker}
                                </Typography>
                                <Typography variant="body1">
                                    Price at Addition: ${stock.price?.toFixed(2) || "N/A"}
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: stock.currentPrice > stock.price ? "green" : "red",
                                        fontWeight: "bold",
                                    }}
                                >
                                    Current Price: ${stock.currentPrice?.toFixed(2) || "N/A"}
                                </Typography>
                                <Chip
                                    label={`Dividend: $${(stock.currentPrice - stock.price)?.toFixed(2)}`}
                                    sx={{
                                        mt: 2,
                                        backgroundColor:
                                            stock.currentPrice > stock.price
                                                ? "rgba(76, 175, 80, 0.1)"
                                                : "rgba(244, 67, 54, 0.1)",
                                        color: stock.currentPrice > stock.price ? "green" : "red",
                                        fontWeight: "bold",
                                    }}
                                />
                            </CardContent>
                            <CardActions>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<ShoppingCart />}
                                    onClick={() => handleOpenBuyDialog(stock)}
                                >
                                    Buy
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<Undo />}
                                    onClick={() => handleRemoveFromWatchlist(stock.id)}
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
            <Dialog open={buyDialogOpen} onClose={() => setBuyDialogOpen(false)}>
                <DialogTitle>Buy Stock</DialogTitle>
                <DialogContent>
                    <Typography variant="subtitle1">
                        {selectedStock?.stock_name} ({selectedStock?.ticker})
                    </Typography>
                    <TextField
                        label="Quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        fullWidth
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBuyDialogOpen(false)} color="error">
                        Cancel
                    </Button>
                    <Button onClick={handleBuy} color="primary">
                        Buy
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default WatchlistComponent;
