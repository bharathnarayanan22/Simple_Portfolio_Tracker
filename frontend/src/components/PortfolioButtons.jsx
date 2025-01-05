import { Tooltip, Button, Grid2, Typography } from "@mui/material";
import PortfolioIcon from "@mui/icons-material/TrendingUp";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import DownloadIcon from "@mui/icons-material/Download";
import PropTypes from "prop-types"; 


const buttonStyles = (color, hoverColor) => ({
  backgroundColor: color,
  transition: "transform 0.3s",
  "&:hover": {
    backgroundColor: hoverColor,
    transform: "scale(1.1)",
  },
});

const PortfolioButtons = ({ onBuyClick, onSellClick, onWatchlistClick, onExportClick }) => (
  <Grid2 container spacing={2} justifyContent="flex-end">
    <Grid2 item>
      <Tooltip title="Buy stocks to add them to your portfolio" arrow>
        <Button
          variant="contained"
          startIcon={<ShoppingCartIcon />}
          onClick={onBuyClick}
          sx={buttonStyles("#4CAF50", "#388E3C")}
        >
          Buy
        </Button>
      </Tooltip>
    </Grid2>
    <Grid2 item>
      <Tooltip title="Sell stocks to reduce your holdings" arrow>
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={onSellClick}
          sx={buttonStyles("#F44336", "#D32F2F")}
        >
          Sell
        </Button>
      </Tooltip>
    </Grid2>
    <Grid2 item>
      <Tooltip title="Add stocks to your watchlist for monitoring" arrow>
        <Button
          variant="contained"
          startIcon={<BookmarkIcon />}
          onClick={onWatchlistClick}
          sx={buttonStyles("#FF9800", "#FB8C00")}
        >
          Watchlist
        </Button>
      </Tooltip>
    </Grid2>
    <Grid2 item>
      <Tooltip title="Download your portfolio as a CSV file" arrow>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={onExportClick}
          sx={buttonStyles("#2196F3", "#1976D2")}
        >
          Export
        </Button>
      </Tooltip>
    </Grid2>
  </Grid2>
);

PortfolioButtons.propTypes = {
  onBuyClick: PropTypes.func.isRequired,
  onSellClick: PropTypes.func.isRequired,
  onWatchlistClick: PropTypes.func.isRequired,
  onExportClick: PropTypes.func.isRequired,
};

const PortfolioHeader = ({ onBuyClick, onSellClick, onWatchlistClick, onExportClick }) => (
  <Grid2 container alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
    <Grid2 item>
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
        <PortfolioIcon sx={{ mr: 1, fontSize: "2rem", color: "#6A5ACD" }} />
        My Portfolio
      </Typography>
    </Grid2>
    <Grid2 item>
      <PortfolioButtons 
      onBuyClick={onBuyClick}
        onSellClick={onSellClick}
        onWatchlistClick={onWatchlistClick}
        onExportClick={onExportClick} />
    </Grid2>
  </Grid2>
);

PortfolioHeader.propTypes = {
  onBuyClick: PropTypes.func.isRequired,
  onSellClick: PropTypes.func.isRequired,
  onWatchlistClick: PropTypes.func.isRequired,
  onExportClick: PropTypes.func.isRequired,
};

export default PortfolioHeader;
