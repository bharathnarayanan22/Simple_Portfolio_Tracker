import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  useTheme,
  useMediaQuery,
  Grid,
} from "@mui/material";
import { keyframes } from "@emotion/react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { AuthContext } from "../context/AuthContext.jsx";
import i1 from "../assets/i1.jpg";
import i2 from "../assets/i2.jpg";
import i3 from "../assets/i3.jpg";
import i4 from "../assets/i4.jpg";
import i5 from "../assets/i5.jpg";
import i6 from "../assets/i6.jpg";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Home = () => {
  const { isLoggedIn } = useContext(AuthContext);

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box sx={{ overflowX: "hidden" }}>
      <Navbar />
      <Box
        sx={{
          textAlign: "left", 
          mt: 4,
          mb: 4,
          px: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: theme.palette.common.white,
          py: 8,
          borderRadius: "16px",
          mx: 2,
          boxShadow: theme.shadows[10],
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography
              variant="h3"
              gutterBottom
              sx={{ fontWeight: 700, animation: `${fadeIn} 1s ease-in-out`, textAlign: 'center'}}
            >
              Welcome to Portfolio Tracker
            </Typography>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ animation: `${fadeIn} 1.5s ease-in-out`, textAlign: 'center' }}
            >
              Your ultimate tool to manage and track your investments.
            </Typography>
            <Box
              sx={{ mt: 3, animation: `${fadeIn} 2s ease-in-out`, textAlign: 'center'}}
            >
              {!isLoggedIn ? (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => navigate("/register")}
                  sx={{
                    mx: 2,
                    px: 4,
                    py: 2,
                    fontWeight: 700,
                    "&:hover": {
                      transform: "scale(1.05)",
                      transition: "transform 0.3s ease-in-out",
                    },
                  }}
                >
                  Start Tracking Your Portfolio
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => navigate("/dashboard")}
                  sx={{
                    mx: 2,
                    px: 4,
                    py: 2,
                    fontWeight: 700,
                    "&:hover": {
                      transform: "scale(1.05)",
                      transition: "transform 0.3s ease-in-out",
                    },
                  }}
                >
                  Your Portfolio
                </Button>
              )}
            </Box>
          </Grid>

          <Grid
            item
            xs={12}
            md={6}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <img
              src={i6} 
              alt="Portfolio Tracker"
              style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Zigzag Content Layout with Advanced Design */}
      <Stack spacing={8} sx={{ px: 4, mt: 8 }}>
        {[
          {
            direction: { xs: "column", md: "row" },
            image: i2,
            alt: "Portfolio Dashboard",
            title: "Your Personalized Portfolio Dashboard",
            content: [
              "Stay on top of your investments with a user-friendly dashboard that consolidates all your financial assets in one place.",
              "Track real-time portfolio performance and receive actionable insights tailored to your investment strategy."
            ],
          },
          {
            direction: { xs: "column", md: "row-reverse" },
            image: i3,
            alt: "Performance Trends",
            title: "Uncover Key Performance Trends",
            content: [
              "Analyze historical data and track your portfolio's growth with advanced performance charts and metrics.",
              "Identify areas for improvement and maximize returns with clear visualizations of your investment progress."
            ],
          },
          {
            direction: { xs: "column", md: "row" },
            image: i1,
            alt: "Stock Management",
            title: "Effortless Stock Management",
            content: [
              "Manage your stock holdings with ease using an intuitive interface that simplifies buying, selling, and organizing assets.",
              "Keep your portfolio up to date with automated updates and real-time data integration."
            ],
          },
          {
            direction: { xs: "column", md: "row-reverse" },
            image: i4,
            alt: "Watchlist",
            title: "Curated Stock Watchlist",
            content: [
              "Create and manage a personalized watchlist to monitor potential investments and market movements.",
              "Receive timely alerts and insights to help you seize market opportunities as they arise."
            ],
          },
          {
            direction: { xs: "column", md: "row" },
            image: i5,
            alt: "Transaction History",
            title: "Comprehensive Transaction History",
            content: [
              "Maintain a detailed log of all your investment transactions, including trades, dividends, and fees.",
              "Gain clarity on your financial journey with accurate and well-organized records for easy review."
            ],
          },          
        ].map((section, index) => (
          <React.Fragment key={index}>
            <Stack
              direction={section.direction}
              spacing={3}
              alignItems="center"
              sx={{
                position: "relative",
                animation: `${fadeIn} 0.5s ease-in-out`,
                "&:hover img": {
                  transform: "scale(1.01)",
                  transition: "transform 0.3s ease-in-out",
                },
              }}
            >
              {/* Image Section */}
              <Box
                sx={{
                  flex: 1,
                  overflow: "hidden",
                  borderRadius: "8px",
                  position: "relative",
                }}
              >
                <LazyLoadImage
                  src={section.image}
                  alt={section.alt}
                  effect="blur"
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    boxShadow: theme.shadows[1],
                    transition: "transform 0.3s ease-in-out",
                    border: `5px solid #013d79`, 
                    backgroundColor: theme.palette.background.paper, 
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    borderRadius: "8px",
                    backgroundColor: "rgba(0, 0, 0, 0.1)", 
                    opacity: 0,
                    transition: "opacity 0.3s ease-in-out",
        
                  }}
                />
              </Box>

              {/* Content Section */}
              <Box sx={{ flex: 1, position: "relative" }}>
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: 2,
                  }}
                >
                  {section.title}
                </Typography>
                {section.content.map((text, idx) => (
                  <Typography
                    key={idx}
                    variant="body1"
                    paragraph
                    sx={{
                      color: theme.palette.text.secondary,
                      lineHeight: 1.6,
                    }}
                  >
                    {text}
                  </Typography>
                ))}
              </Box>
            </Stack>

            {/* Divider Line */}
            {index < 4 && (
              <Box
                sx={{
                  width: "100%",
                  height: "1px",
                  background: `linear-gradient(90deg, ${theme.palette.divider}, transparent)`,
                  my: 6,
                  mx: "auto",
                  position: "relative",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "80%",
                    height: "1px",
                    background: theme.palette.divider,
                  },
                }}
              />
            )}
          </React.Fragment>
        ))}
      </Stack>

      {/* Call-to-Action Section */}
      <Box
        sx={{
          textAlign: "center",
          mt: 8,
          mb: 4,
          px: 2,
          background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
          color: theme.palette.common.white,
          py: 8,
          borderRadius: "16px",
          mx: 2,
          boxShadow: theme.shadows[10],
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: 700, animation: `${fadeIn} 1s ease-in-out` }}
        >
          Ready to take control of your investments?
        </Typography>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ animation: `${fadeIn} 1.5s ease-in-out` }}
        >
          Sign up today and start tracking your portfolio like a pro.
        </Typography>
        <Box sx={{ mt: 3, animation: `${fadeIn} 2s ease-in-out` }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate(isLoggedIn ? "/dashboard" : "/register")}
            sx={{
              mx: 2,
              px: 4,
              py: 2,
              fontWeight: 700,
              "&:hover": {
                transform: "scale(1.05)",
                transition: "transform 0.3s ease-in-out",
              },
            }}
          >
            {isLoggedIn ? "Go to Dashboard" : "Get Started Now"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
