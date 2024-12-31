import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Box, Typography, Button, Stack, Paper } from "@mui/material";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Check for token in local storage
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token); // Set to true if token exists, otherwise false
  }, []);

  return (
    <Box>
      <Navbar />
      <Box
        sx={{
          textAlign: "center",
          mt: 4,
          mb: 4,
          px: 2,
        }}
      >
        <Typography variant="h3" gutterBottom>
          Welcome to Portfolio Tracker
        </Typography>
        <Typography variant="h6" gutterBottom>
          Your ultimate tool to manage and track your investments.
        </Typography>
        <Box sx={{ mt: 3 }}>
          {!isLoggedIn ? (
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate("/register")}
              sx={{ mx: 2 }}
            >
              Start Tracking Your Portfolio
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={() => navigate("/dashboard")}
              sx={{ mx: 2 }}
            >
              Your Portfolio
            </Button>
          )}
        </Box>
      </Box>

      {/* Zigzag Content Layout */}
      <Stack spacing={5} sx={{ px: 4 }}>
        {/* First Zigzag Section */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="center">
          <Box sx={{ flex: 1 }}>
            <img
              src="/images/portfolio-visualization.png"
              alt="Portfolio Visualization"
              style={{ width: "100%", borderRadius: "8px" }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Track and visualize your Freetrade portfolio
              </Typography>
              <Typography variant="body1" paragraph>
                Get a better view of your stocks, ETFs, and cryptocurrencies with an easy-to-use portfolio tracker.
              </Typography>
              <Typography variant="body1" paragraph>
                Most brokers don't show you the numbers that matter in the long term. We show you your true net annualized return rate, annualized fee ratio, capital gains yield, and dividend yield.
              </Typography>
            </Paper>
          </Box>
        </Stack>

        {/* Second Zigzag Section */}
        <Stack direction={{ xs: "column", md: "row-reverse" }} spacing={3} alignItems="center">
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Your portfolios
              </Typography>
              <Typography variant="body1" paragraph>
                Import your trades from the following brokers, from a CSV file or add them manually.
              </Typography>
              <Typography variant="body1" paragraph>
                We support platforms like DEGIRO, Trading 212, Interactive Brokers, Freetrade, Revolut, Swissquote, and many others.
              </Typography>
            </Paper>
          </Box>
          <Box sx={{ flex: 1 }}>
            <img
              src="/images/portfolio-dashboard.png"
              alt="Portfolio Dashboard"
              style={{ width: "100%", borderRadius: "8px" }}
            />
          </Box>
        </Stack>

        {/* Third Zigzag Section */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="center">
          <Box sx={{ flex: 1 }}>
            <img
              src="/images/dividend-income.png"
              alt="Dividend Income"
              style={{ width: "100%", borderRadius: "8px" }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Track your dividend income
              </Typography>
              <Typography variant="body1" paragraph>
                You no longer have to manually enter your dividends into a spreadsheet. All dividends and other corporate actions get automatically imported into your portfolio.
              </Typography>
            </Paper>
          </Box>
        </Stack>

        {/* Fourth Zigzag Section */}
        <Stack direction={{ xs: "column", md: "row-reverse" }} spacing={3} alignItems="center">
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Make sure your portfolio is diversified
              </Typography>
              <Typography variant="body1" paragraph>
                Break down your portfolio by asset class, region, and sector to ensure proper diversification.
              </Typography>
            </Paper>
          </Box>
          <Box sx={{ flex: 1 }}>
            <img
              src="/images/asset-allocation.png"
              alt="Asset Allocation"
              style={{ width: "100%", borderRadius: "8px" }}
            />
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
};

export default Home;
