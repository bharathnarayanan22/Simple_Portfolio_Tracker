import React, { useState, useContext } from "react";
import { styled, ThemeProvider, createTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useNavigate } from "react-router-dom";
import List from "@mui/material/List";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PortfolioIcon from "@mui/icons-material/AccountBalance";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import TransactionIcon from "@mui/icons-material/AccountTree";
import { BusinessCenter as StocksIcon} from '@mui/icons-material';
import register_bg from "../assets/register_bg.jpg"
import OverviewComponent from "../components/OverviewComponent";
import StocksManagementComponent from "../components/StocksManagementComponent";
import PortfolioComponent from "../components/PortfolioComponent";
import WatchlistComponent from "../components/WatchlistComponent";
import TransactionsComponent from "../components/TransactionsComponent";
import { AuthContext } from "../context/AuthContext.jsx";

const drawerWidth = 240;
const userName = localStorage.getItem("name");

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  })
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, 
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

export default function PortfolioTrackerDashboard() {
  const [open, setOpen] = useState(false);
  const [selectedView, setSelectedView] = useState("Overview");
  const [isBuying1, setIsBuying1] = useState(false);
  const { isLoggedIn, logout } = useContext(AuthContext);
  const [view1, setView1] = useState("cards");
  const navigate = useNavigate();
  const theme = useTheme();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleMenuItemClick = (view) => {
    setSelectedView(view);
  };

  const handleHomeClick = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    logout();
    navigate("/");
  };

  const handleBuyClick = () => {
    setIsBuying1(true);
    setView1("stocks");
    setSelectedView("Stocks Management");
  };

  const handleSellClick = () => {
    setIsBuying1(false);
    setView1("stocks");
    setSelectedView("Stocks Management");
  };

  const handleWatchlistClick = () => {
    setSelectedView("Watchlist");
  };

  const handleExportClick = () => {
    console.log("Export button clicked");
  };

  const handlePortfolioClick = () => {
    setSelectedView("Portfolio");
  };

  const handleStockClick = () => {
    setSelectedView("Stocks Management");
  };

  const handleTransactionClick = () => {
    setSelectedView("Transactions");
  };

  const selectedStyle = {
    backgroundColor: "#013d79",
    color: "white",
  };
  console.log(`User ${userName}`)

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          backgroundImage: `url(${register_bg})`, 
          backgroundSize: "cover", 
          backgroundPosition: "center", 
          backgroundRepeat: "no-repeat", 
          backgroundAttachment: "fixed",
        }}
      >
        <CssBaseline />
        <AppBar position="fixed" open={open}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{ mr: 2, ...(open && { display: "none" }) }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" color="white">
              Portfolio Tracker Dashboard
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <AccountCircleIcon sx={{ marginRight: 1 }} />
            <Typography sx={{ color: "white" }}>{userName}</Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
          variant="persistent"
          anchor="left"
          open={open}
        >
          <Box>
            <DrawerHeader>
              <IconButton
                onClick={handleDrawerClose}
                color="inherit"
                sx={{
                  "&:hover": { backgroundColor: "#013d79", color: "white" },
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
            </DrawerHeader>
            <Divider />
            <List>
              <ListItemButton
                onClick={() => handleMenuItemClick("Overview")}
                sx={{
                  "&:hover": { backgroundColor: "#013d79", color: "white" },
                  gap: "32px",
                  ...(selectedView === "Overview" && selectedStyle),
                }}
              >
                <TrendingUpIcon />
                <ListItemText primary="Overview" />
              </ListItemButton>
              <ListItemButton
                onClick={() => handleMenuItemClick("Stocks Management")}
                sx={{
                  "&:hover": { backgroundColor: "#013d79", color: "white" },
                  gap: "32px",
                  ...(selectedView === "Stocks Management" && selectedStyle),
                }}
              >
                <StocksIcon  />
                <ListItemText primary="Stocks Management" />
              </ListItemButton>
              <ListItemButton
                onClick={() => handleMenuItemClick("Portfolio")}
                sx={{
                  "&:hover": { backgroundColor: "#013d79", color: "white" },
                  gap: "32px",
                  ...(selectedView === "Portfolio" && selectedStyle),
                }}
              >
                <PortfolioIcon />
                <ListItemText primary="Portfolio" />
              </ListItemButton>
              <ListItemButton
                onClick={() => handleMenuItemClick("Watchlist")}
                sx={{
                  "&:hover": { backgroundColor: "#013d79", color: "white" },
                  gap: "32px",
                  ...(selectedView === "Watchlist" && selectedStyle),
                }}
              >
                <BookmarkIcon />
                <ListItemText primary="Watchlist" />
              </ListItemButton>
              <ListItemButton
                onClick={() => handleMenuItemClick("Transactions")}
                sx={{
                  "&:hover": { backgroundColor: "#013d79", color: "white" },
                  gap: "32px",
                  ...(selectedView === "Transactions" && selectedStyle),
                }}
              >
                <TransactionIcon />
                <ListItemText primary="Transactions" />
              </ListItemButton>
            </List>
          </Box>
          <Box sx={{ marginTop: "auto" }}>
            <Divider />
            <ListItemButton
              onClick={handleHomeClick}
              sx={{
                "&:hover": { backgroundColor: "#013d79", color: "white" },
                gap: "32px",
              }}
            >
              <ExitToAppIcon />
              <ListItemText primary="Log Out" />
            </ListItemButton>
          </Box>
        </Drawer>
        <Main open={open}>
          <DrawerHeader />
          {selectedView === "Overview" && (
            <OverviewComponent
              onNavigateToPortfolio={handlePortfolioClick}
              onNavigateToStocks={handleStockClick}
              onNavigateToTranscations={handleTransactionClick}
              onNavigateToWatchlistUpdate={handleWatchlistClick}
            />
          )}
          {selectedView === "Stocks Management" && (
            <StocksManagementComponent
              isBuying1={isBuying1}
              setIsBuying1={setIsBuying1}
              view1={view1}
              setView1={setView1}
            />
          )}
          {selectedView === "Portfolio" && (
            <PortfolioComponent
              onBuyClick={handleBuyClick}
              onSellClick={handleSellClick}
              onWatchlistClick={handleWatchlistClick}
              onExportClick={handleExportClick}
            />
          )}
          {selectedView === "Watchlist" && <WatchlistComponent />}
          {selectedView === "Transactions" && <TransactionsComponent />}
        </Main>
      </Box>
    </ThemeProvider>
  );
}
