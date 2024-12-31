import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check for token in local storage
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        {/* Logo Section */}
        
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          Portfolio Tracker
        </Typography>

        {/* Navigation Links */}
        {!isLoggedIn ? (
          <>
            <Button
              color="inherit"
              onClick={() => navigate("/login")}
              sx={{ mx: 1 }}
            >
              Login
            </Button>
            <Button
              color="inherit"
              onClick={() => navigate("/register")}
              sx={{ mx: 1 }}
            >
              Register
            </Button>
          </>
        ) : (
          <>
            <Button
              color="inherit"
              onClick={() => navigate("/dashboard")}
              sx={{ mx: 1 }}
            >
              Dashboard
            </Button>
            <Button
              color="inherit"
              onClick={handleLogout}
              sx={{ mx: 1 }}
            >
              Logout
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
