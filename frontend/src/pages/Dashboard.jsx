import React, { useState } from "react";
import { styled, ThemeProvider, createTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
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

import OverviewComponent from "../components/OverviewComponent";
import StocksManagementComponent from "../components/StocksManagementComponent";
import PortfolioComponent from "../components/PortfolioComponent";
import WatchlistComponent from "../components/WatchlistComponent";
import TransactionsComponent from "../components/TransactionsComponent";

const drawerWidth = 240;
const userName = localStorage.getItem('name');

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

const theme = createTheme({
  palette: {
    primary: {
      main: "#013d79",
    },
    secondary: {
      main: "#013d79",
    },
  },
});

export default function PortfolioTrackerDashboard() {
  const [open, setOpen] = useState(false);
  const [selectedView, setSelectedView] = useState("Overview"); // Set default to "Overview"

  const navigate = useNavigate();

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
    navigate("/register");
  };

  const selectedStyle = {
    backgroundColor: "#013d79",
    color: "white",
  };


  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
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
            <Typography>{userName}</Typography>
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
                <PortfolioIcon />
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
          {selectedView === "Overview" && <OverviewComponent />}
          {selectedView === "Stocks Management" && <StocksManagementComponent />}
          {selectedView === "Portfolio" && <PortfolioComponent />}
          {selectedView === "Watchlist" && <WatchlistComponent />}
          {selectedView === "Transactions" && <TransactionsComponent />}
        </Main>
      </Box>
    </ThemeProvider>
  );
}
