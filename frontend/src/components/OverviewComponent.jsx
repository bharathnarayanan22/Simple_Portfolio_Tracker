import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  CircularProgress,
} from "@mui/material";
import PortfolioIcon from "@mui/icons-material/TrendingUp";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SellIcon from "@mui/icons-material/Sell";
import VisibilityIcon from "@mui/icons-material/Visibility";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PropTypes from "prop-types";
import axios from "axios";

// Adding the Keyframes CSS animation
import { keyframes } from "@mui/system";

const scaleUp = keyframes`
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.05);
  }
`;

const OverviewComponent = ({ onNavigateToPortfolio, onNavigateToStocks, onNavigateToTranscations, onNavigateToWatchlistUpdate }) => {
  const [overallTopStocks, setOverallTopStocks] = useState([]);
  const [myTopStocks, setMyTopStocks] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [watchlistStocks, setWatchlistStocks] = useState([]);
  const [mockNews, setMockNews] = useState([
    "Markets rally as tech stocks surge.",
    "Oil prices stabilize after recent fluctuations.",
    "Central bank announces interest rate decisions.",
  ]);
  const [mockNotifications, setMockNotifications] = useState([
    "Dividend payout received for AAPL.",
    "Portfolio value increased by 5% this week.",
    "New stock recommendation: Tesla (TSLA).",
  ]);
  const [loadingWatchlist, setLoadingWatchlist] = useState(true);
  const [errorWatchlist, setErrorWatchlist] = useState(null);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allStocksResponse = await axios.get(
          "http://localhost:8080/stocks"
        );
        const allStocks = allStocksResponse.data;
        const sortedOverallStocks = [...allStocks].sort(
          (a, b) => b.volume * b.price - a.volume * a.price
        );
        setOverallTopStocks(sortedOverallStocks.slice(0, 3));

        const portfolioResponse = await axios.get(
          `http://localhost:8080/api/users/${userId}/portfolio`
        );
        const portfolioData = portfolioResponse.data;

        const portfolioWithDetails = portfolioData.map((portfolioStock) => {
          const stockDetails = allStocks.find(
            (stock) => stock.ticker === portfolioStock.ticker
          );

          const currentPrice = stockDetails
            ? stockDetails.price
            : portfolioStock.purchasePrice;

          return {
            ...portfolioStock,
            currentPrice,
            profitLoss: currentPrice - portfolioStock.purchasePrice,
          };
        });

        const sortedMyStocks = portfolioWithDetails.sort(
          (a, b) => b.profitLoss - a.profitLoss
        );
        setMyTopStocks(sortedMyStocks.slice(0, 3));

        const transactionsResponse = await axios.get(
          `http://localhost:8080/api/users/${userId}/transactions`
        );
        const transactions = transactionsResponse.data;

        const sortedTransactions = [...transactions].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setRecentTransactions(sortedTransactions.slice(0, 3));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchWatchlistUpdates = async () => {
      try {
        const watchlistResponse = await axios.get(
          `http://localhost:8080/api/users/${userId}/watchlist`
        );
        const watchlistStocks = watchlistResponse.data;

        const stockDetails = await Promise.all(
          watchlistStocks.map((stock) =>
            axios.get(`http://localhost:8080/stocks/${stock}`)
          )
        );

        const enrichedStocks = stockDetails.map((response, index) => {
          const stock = response.data;
          const addedPrice = stock.price
            ? stock.price * (1 + (Math.random() * 0.2 - 0.1))
            : null;
          const percentageChange =
            ((stock.price - addedPrice) / addedPrice) * 100;

          return {
            ...stock,
            percentageChange: percentageChange.toFixed(2),
          };
        });

        setWatchlistStocks(
          enrichedStocks.filter((stock) => stock.percentageChange < 0)
        );
      } catch (error) {
        setErrorWatchlist("Failed to fetch watchlist updates.");
      } finally {
        setLoadingWatchlist(false);
      }
    };

    fetchWatchlistUpdates();
  }, [userId]);

  return (
    <Box sx={{ padding: 4 }}>
      {/* Header Section */}
      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 4 }}
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
          <TrendingUpIcon sx={{ mr: 1, fontSize: "2rem", color: "#6A5ACD" }} />
          Overview
        </Typography>
        <Tooltip title="View and manage your portfolio" arrow>
          <Button
            variant="contained"
            startIcon={<PortfolioIcon />}
            onClick={onNavigateToPortfolio}
            sx={{
              backgroundColor: "#013d79",
              color: "#FFF",
              fontWeight: "bold",
              textTransform: "uppercase",
              transition: "transform 0.3s",
              "&:hover": {
                backgroundColor: "#1976D2",
                transform: "scale(1.1)",
              },
            }}
          >
            Go to Portfolio
          </Button>
        </Tooltip>
      </Grid>

      <Divider sx={{ mb: 2 }} />

      <Grid>
        <Grid container spacing={5} sx={{ mb: "4%" }}>
          {/* Overall Stocks Performance */}
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                bgcolor: "#FFFFFF", // White background for the card
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)", // Soft shadow for neumorphic effect
                borderRadius: 3,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.2)", // Increased shadow on hover
                },
              }}
            >
              {/* Upper Section */}
              <Box
                sx={{
                  background: "linear-gradient(135deg, #6A11CB, #2575FC)", // Gradient background
                  color: "#FFFFFF", // White text color
                  padding: 3,
                  borderRadius: "12px 12px 0 0", // Rounded top corners
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)", // Subtle shadow for depth
                  position: "relative", // For positioning the button
                  overflow: "hidden", // Ensures no overflow from child elements
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between", // Ensures the button stays on the same line as the title
                    marginBottom: 0, // Remove extra space below title
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <TrendingUpIcon
                      sx={{ mr: 1, fontSize: "1.5rem", color: "#FFD700" }}
                    />
                    Overall Top Stocks
                  </Box>
                  <Button
                    variant="text"
                    onClick={onNavigateToStocks}
                    sx={{
                      minWidth: "auto",
                      padding: "8px 12px",
                      color: "#FFFFFF",
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      textTransform: "none",
                      borderRadius: "8px",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        color: "#FFD700",
                        transform: "scale(1.1)",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                      },
                      "&:active": {
                        transform: "scale(0.95)",
                      },
                    }}
                  >
                    <ArrowForwardIcon sx={{ fontSize: "1.5rem" }} />
                  </Button>
                </Typography>
              </Box>

              {/* Lower Section */}
              <CardContent sx={{ padding: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  {overallTopStocks.slice(0, 3).map((stock, index) => (
                    <Box
                      key={stock.stockId}
                      sx={{
                        textAlign: "center",
                        transition: "transform 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      {/* Animated Icons with Pulse Effect */}
                      <Box
                        sx={{
                          fontSize: "3rem",
                          color:
                            index === 0
                              ? "#FFD700" // Gold for 1st place
                              : index === 1
                              ? "#C0C0C0" // Silver for 2nd place
                              : "#CD7F32", // Bronze for 3rd place
                          animation: "pulse 1.5s infinite",
                          "@keyframes pulse": {
                            "0%, 100%": {
                              transform: "scale(1)",
                            },
                            "50%": {
                              transform: "scale(1.1)",
                            },
                          },
                        }}
                      >
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                      </Box>

                      {/* Stock Details */}
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#2C3E50", // Dark blue text color
                          fontWeight: "bold",
                          mt: 1,
                        }}
                      >
                        {stock.name} ({stock.ticker})
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: stock.price >= 0 ? "#27AE60" : "#E74C3C", // Green for profit, red for loss
                          fontWeight: "bold",
                        }}
                      >
                        {stock.price >= 0
                          ? `+${stock.price.toFixed(2)}`
                          : `${stock.price.toFixed(2)}`}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* My Stocks Performance */}
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                bgcolor: "#FFFFFF", // White background for the card
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)", // Soft shadow for neumorphic effect
                borderRadius: 3,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.2)", // Increased shadow on hover
                },
              }}
            >
              {/* Upper Section */}
              <Box
                sx={{
                  background: "linear-gradient(135deg, #6A11CB, #2575FC)", // Gradient background
                  color: "#FFFFFF", // White text color
                  padding: 3,
                  borderTopLeftRadius: 3,
                  borderTopRightRadius: 3,
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between", 
                    marginBottom: 0, 
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <TrendingUpIcon
                      sx={{ mr: 1, fontSize: "1.5rem", color: "#FFD700" }}
                    />
                    My Top Stocks
                  </Box>
                  <Button
                    variant="text"
                    onClick={onNavigateToStocks}
                    sx={{
                      minWidth: "auto",
                      padding: "8px 12px",
                      color: "#FFFFFF",
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      textTransform: "none",
                      borderRadius: "8px",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        color: "#FFD700",
                        transform: "scale(1.1)",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                      },
                      "&:active": {
                        transform: "scale(0.95)",
                      },
                    }}
                  >
                    <ArrowForwardIcon sx={{ fontSize: "1.5rem" }} />
                  </Button>
                </Typography>
              </Box>

              {/* Lower Section */}
              <CardContent sx={{ padding: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  {myTopStocks.slice(0, 3).map((stock, index) => (
                    <Box
                      key={stock.stockId}
                      sx={{
                        textAlign: "center",
                        transition: "transform 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      {/* Animated Icons with Pulse Effect */}
                      <Box
                        sx={{
                          fontSize: "3rem",
                          color:
                            index === 0
                              ? "#FFD700" // Gold for 1st place
                              : index === 1
                              ? "#C0C0C0" // Silver for 2nd place
                              : "#CD7F32", // Bronze for 3rd place
                          animation: "pulse 1.5s infinite",
                          "@keyframes pulse": {
                            "0%, 100%": {
                              transform: "scale(1)",
                            },
                            "50%": {
                              transform: "scale(1.1)",
                            },
                          },
                        }}
                      >
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                      </Box>

                      {/* Stock Details */}
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#2C3E50", // Dark blue text color
                          fontWeight: "bold",
                          mt: 1,
                        }}
                      >
                        {stock.name} ({stock.ticker})
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: stock.profitLoss >= 0 ? "#27AE60" : "#E74C3C", // Green for profit, red for loss
                          fontWeight: "bold",
                        }}
                      >
                        {stock.profitLoss >= 0
                          ? `+${stock.profitLoss.toFixed(2)}`
                          : `${stock.profitLoss.toFixed(2)}`}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Transactions */}
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                bgcolor: "#FFFFFF", // White background for the card
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)", // Soft shadow for neumorphic effect
                borderRadius: 3,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "scale(1.02)",
                  boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.2)", // Increased shadow on hover
                },
              }}
            >
              {/* Upper Section */}
              <Box
                sx={{
                  background: "linear-gradient(135deg, #6A11CB, #2575FC)", // Gradient background
                  color: "#FFFFFF", // White text color
                  padding: 3,
                  borderTopLeftRadius: 3,
                  borderTopRightRadius: 3,
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between", 
                    marginBottom: 0, 
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <TrendingUpIcon
                      sx={{ mr: 1, fontSize: "1.5rem", color: "#FFD700" }}
                    />
                    Recent Transactions
                  </Box>
                  <Button
                    variant="text"
                    onClick={onNavigateToTranscations}
                    sx={{
                      minWidth: "auto",
                      padding: "8px 12px",
                      color: "#FFFFFF",
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      textTransform: "none",
                      borderRadius: "8px",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        color: "#FFD700",
                        transform: "scale(1.1)",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                      },
                      "&:active": {
                        transform: "scale(0.95)",
                      },
                    }}
                  >
                    <ArrowForwardIcon sx={{ fontSize: "1.5rem" }} />
                  </Button>
                </Typography>
              </Box>

              {/* Lower Section */}
              <CardContent sx={{ padding: 3 }}>
                <List>
                  {recentTransactions.map((transaction, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 2,
                        padding: 2,
                        borderRadius: 2,
                        backgroundColor: "#F5F5F5", // Light gray background for each transaction
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        "&:hover": {
                          transform: "translateX(10px)", // Slide effect on hover
                          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", // Shadow on hover
                        },
                      }}
                    >
                      {/* Transaction Icon */}
                      <Box
                        sx={{
                          bgcolor:
                            transaction.action === "Buy"
                              ? "#27AE60"
                              : "#E74C3C", // Green for Buy, Red for Sell
                          color: "#FFFFFF",
                          borderRadius: "50%",
                          width: 40,
                          height: 40,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mr: 2,
                        }}
                      >
                        {transaction.action === "Buy" ? (
                          <ShoppingCartIcon fontSize="small" />
                        ) : (
                          <SellIcon fontSize="small" />
                        )}
                      </Box>

                      {/* Transaction Details */}
                      <ListItemText
                        primary={
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: "bold",
                              color: "#2C3E50", // Dark blue text color
                            }}
                          >
                            {transaction.action} {transaction.quantity} shares
                            of {transaction.ticker}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#7F8C8D", // Gray text color for secondary info
                            }}
                          >
                            Date:{" "}
                            {new Date(transaction.date).toLocaleDateString()}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* News Section */}
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                bgcolor: "#FFFFFF", // White background for the card
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)", // Soft shadow for neumorphic effect
                borderRadius: 3,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "scale(1.02)",
                  boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.2)", // Increased shadow on hover
                },
              }}
            >
              {/* Upper Section */}
              <Box
                sx={{
                  background: "linear-gradient(135deg, #6A11CB, #2575FC)", // Gradient background
                  color: "#FFFFFF", // White text color
                  padding: 3,
                  borderTopLeftRadius: 3,
                  borderTopRightRadius: 3,
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <NotificationsIcon sx={{ mr: 1, fontSize: "1.5rem" }} />{" "}
                  {/* Icon for notifications */}
                  Notifications
                </Typography>
              </Box>

              {/* Lower Section */}
              <CardContent sx={{ padding: 3 }}>
                <List>
                  {mockNotifications.map((notification, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 2,
                        padding: 2,
                        borderRadius: 2,
                        backgroundColor: "#F5F5F5", // Light gray background for each notification
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        "&:hover": {
                          transform: "translateX(10px)", // Slide effect on hover
                          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", // Shadow on hover
                        },
                      }}
                    >
                      {/* Notification Icon */}
                      <Box
                        sx={{
                          bgcolor: "#FFC107", // Orange background for notifications
                          color: "#FFFFFF",
                          borderRadius: "50%",
                          width: 40,
                          height: 40,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mr: 2,
                        }}
                      >
                        <NotificationsIcon fontSize="small" />{" "}
                        {/* Icon for notifications */}
                      </Box>

                      {/* Notification Details */}
                      <ListItemText
                        primary={
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: "bold",
                              color: "#2C3E50", // Dark blue text color
                            }}
                          >
                            {notification}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          {/* Notifications */}

          <Grid item xs={12}>
            <Card
              sx={{
                bgcolor: "#FFFFFF", // White background for the card
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)", // Soft shadow for neumorphic effect
                borderRadius: 3,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "scale(1.02)",
                  boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.2)", // Increased shadow on hover
                },
              }}
            >
              {/* Upper Section */}
              <Box
                sx={{
                  background: "linear-gradient(135deg, #6A11CB, #2575FC)", // Gradient background
                  color: "#FFFFFF", // White text color
                  padding: 3,
                  borderTopLeftRadius: 3,
                  borderTopRightRadius: 3,
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <NewspaperIcon sx={{ mr: 1, fontSize: "1.5rem" }} />{" "}
                  {/* Icon for news */}
                  News
                </Typography>
              </Box>

              {/* Lower Section */}
              <CardContent sx={{ padding: 3 }}>
                <List>
                  {mockNews.map((newsItem, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 2,
                        padding: 2,
                        borderRadius: 2,
                        backgroundColor: "#F5F5F5", // Light gray background for each news item
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        "&:hover": {
                          transform: "translateX(10px)", // Slide effect on hover
                          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", // Shadow on hover
                        },
                      }}
                    >
                      {/* News Icon */}
                      <Box
                        sx={{
                          bgcolor: "#2196F3", // Blue background for news
                          color: "#FFFFFF",
                          borderRadius: "50%",
                          width: 40,
                          height: 40,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mr: 2,
                        }}
                      >
                        <NewspaperIcon fontSize="small" /> {/* Icon for news */}
                      </Box>

                      {/* News Details */}
                      <ListItemText
                        primary={
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: "bold",
                              color: "#2C3E50", // Dark blue text color
                            }}
                          >
                            {newsItem}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Watchlist Updates */}
          <Grid item xs={12}>
            <Card
              sx={{
                bgcolor: "#FFFFFF", // White background for the card
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)", // Soft shadow for neumorphic effect
                borderRadius: 3,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "scale(1.02)",
                  boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.2)", // Increased shadow on hover
                },
              }}
            >
              {/* Upper Section */}
              <Box
                sx={{
                  background: "linear-gradient(135deg, #6A11CB, #2575FC)", // Gradient background
                  color: "#FFFFFF", // White text color
                  padding: 3,
                  borderTopLeftRadius: 3,
                  borderTopRightRadius: 3,
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between", 
                    marginBottom: 0, 
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <TrendingUpIcon
                      sx={{ mr: 1, fontSize: "1.5rem", color: "#FFD700" }}
                    />
                    Watchlist Updates
                  </Box>
                  <Button
                    variant="text"
                    onClick={onNavigateToWatchlistUpdate}
                    sx={{
                      minWidth: "auto",
                      padding: "8px 12px",
                      color: "#FFFFFF",
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      textTransform: "none",
                      borderRadius: "8px",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        color: "#FFD700",
                        transform: "scale(1.1)",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                      },
                      "&:active": {
                        transform: "scale(0.95)",
                      },
                    }}
                  >
                    <ArrowForwardIcon sx={{ fontSize: "1.5rem" }} />
                  </Button>
                </Typography>
              </Box>

              {/* Lower Section */}
              <CardContent sx={{ padding: 3 }}>
                {watchlistStocks.length > 0 ? (
                  <List>
                    {watchlistStocks.map((stock) => (
                      <ListItem
                        key={stock.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 2,
                          padding: 2,
                          borderRadius: 2,
                          backgroundColor: "#F5F5F5", // Light gray background for each stock
                          transition:
                            "transform 0.3s ease, box-shadow 0.3s ease",
                          "&:hover": {
                            transform: "translateX(10px)", // Slide effect on hover
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", // Shadow on hover
                          },
                        }}
                      >
                        {/* Stock Icon */}
                        <Box
                          sx={{
                            bgcolor: "#E74C3C", // Red background for price decrease
                            color: "#FFFFFF",
                            borderRadius: "50%",
                            width: 40,
                            height: 40,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mr: 2,
                          }}
                        >
                          <TrendingDownIcon fontSize="small" />{" "}
                          {/* Icon for price decrease */}
                        </Box>

                        {/* Stock Details */}
                        <ListItemText
                          primary={
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: "bold",
                                color: "#2C3E50", // Dark blue text color
                              }}
                            >
                              {stock.stock_name} ({stock.ticker})
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#7F8C8D", // Gray text color for secondary info
                              }}
                            >
                              Price Decrease: {Math.abs(stock.percentageChange)}
                              %
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#7F8C8D", // Gray text color
                      textAlign: "center",
                      mt: 2,
                    }}
                  >
                    No stocks with a price decrease.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

OverviewComponent.propTypes = {
  onNavigateToPortfolio: PropTypes.func.isRequired,
  onNavigateToStocks: PropTypes.func.isRequired,
  onNavigateToWatchlistUpdate: PropTypes.func.isRequired,
  onNavigateToTranscations: PropTypes.func.isRequired,
};

export default OverviewComponent;
