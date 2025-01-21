import React, { useEffect, useState } from "react";
import PortfolioButtons from "./PortfolioButtons";
import {
  Container,
  Grid,
  Grid2,
  Card,
  CardContent,
  Typography,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Divider,
  TextField,
  TablePagination,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Chip,
  Switch,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
} from "chart.js";
import axios from "axios";
import PortfolioHeader from "./PortfolioButtons";
import TableChartIcon from "@mui/icons-material/TableChart";
import {
  AccessTime,
  MonetizationOn,
  TrendingUp,
  AttachMoney,
} from "@mui/icons-material";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
ChartJS.register(
  ArcElement,
  ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title
);
import { format } from "date-fns";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PropTypes from "prop-types";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

const PortfolioComponent = ({
  onBuyClick,
  onSellClick,
  onWatchlistClick,
  onExportClick,
}) => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalValue: 0,
    totalInvestment: 0,
    profitLoss: 0,
    growthPercentage: 0,
    totalDividends: 0,
  });
  const [sectorData, setSectorData] = useState({});
  const [dividendData, setDividendData] = useState({});
  const [timelineData, setTimelineData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filter, setFilter] = useState("");
  const [selectedStock, setSelectedStock] = useState("");
  const [tableView, setTableView] = useState(true);
  const [stockPriceHistory, setStockPriceHistory] = useState([]);

  const sectorMap = {
    Tech: ["AAPL", "MSFT", "GOOG"],
    Healthcare: ["JNJ", "PFE", "MRK"],
    Finance: ["JPM", "GS", "C", "BAC"],
    Energy: ["XOM", "CVX", "SLB"],
    Consumer: ["DIS", "KO", "MCD"],
  };

  const sliderSettings = {
    infinite: true,
    speed: 10000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0,
    cssEase: "linear",
    variableWidth: true,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          variableWidth: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          variableWidth: true,
        },
      },
    ],
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");
  
    const fetchPortfolio = async () => {
      setLoading(true);
      try {
        const [portfolioResponse, allStocksResponse] = await Promise.all([
          axios.get(`http://localhost:8080/api/users/${userId}/portfolio`),
          axios.get("http://localhost:8080/stocks"),
        ]);
  
        const portfolioData = portfolioResponse.data;
        const allStocks = allStocksResponse.data;
  
        const matchedPortfolio = portfolioData.map((portfolioStock) => {
          const stockDetails = allStocks.find(
            (stock) => stock.ticker === portfolioStock.ticker
          );
          return stockDetails
            ? {
                ...portfolioStock,
                stockId: stockDetails.id,
                currentPrice: stockDetails.price,
                sector: stockDetails.sector || "Unknown",
                dividendYield: Math.random() * 0.05,
              }
            : {
                ...portfolioStock,
                currentPrice: portfolioStock.purchasePrice,
              };
        });
  
        const sectorData = calculateSectorData(matchedPortfolio);
        setSectorData(sectorData);
  
        await fetchPortfolioHistory(matchedPortfolio);
        setPortfolio(matchedPortfolio);
        calculateSummary(matchedPortfolio);
        calculateDividendData(matchedPortfolio);
      } catch (error) {
        console.error("Error fetching portfolio or stocks:", error);
      } finally {
        setLoading(false);
      }
    };
  
    const calculateSectorData = (portfolio) => {
      const sectorMap = {
        Tech: ["AAPL", "MSFT", "GOOGL", "NVDA", "TSLA", "AMD", "INTC", "CSCO", "ADBE", "CRM"],
        Healthcare: ["JNJ", "PFE", "MRK"],
        Finance: ["BRK.A", "V", "MA", "JPM", "GS", "C"],
        Energy: ["XOM", "CVX"],
        Consumer: ["KO", "PEP", "PG", "WMT", "TGT", "HD"],
      };
  
      return portfolio.reduce((acc, stock) => {
        const sector = Object.keys(sectorMap).find((key) =>
          sectorMap[key].includes(stock.ticker)
        ) || "Other";
        acc[sector] = (acc[sector] || 0) + stock.currentPrice * stock.quantity;
        return acc;
      }, {});
    };
  
    const fetchPortfolioHistory = async (portfolio) => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/portfolio/history/${userId}`
        );
        const data = response.data;
  
        setTimelineData(
          data.map((entry) => ({
            timestamp: entry.timestamp,
            date: format(new Date(entry.timestamp), "dd-MM-yyyy"),
            value: entry.totalValue,
          }))
        );
  
        if (data.length) {
          await fetchStockPricesFromTimestamp(portfolio, data[0].timestamp);
        }
      } catch (error) {
        console.error("Error fetching portfolio history:", error);
      }
    };
  
    const fetchStockPricesFromTimestamp = async (portfolio, timestamp) => {
      try {
        const stockPriceData = await Promise.all(
          portfolio.map(async (stock) => {
            const response = await axios.get(
              `http://localhost:8080/api/stockPrices/history/${stock.stockId}`
            );
            const stockPrices = response.data.filter(
              (priceData) =>
                new Date(priceData.timestamp) >= new Date(timestamp)
            );
            return {
              ticker: stock.ticker,
              prices: stockPrices.map((priceData) => ({
                timestamp: priceData.timestamp,
                price: priceData.price,
              })),
            };
          })
        );
        setStockPriceHistory(stockPriceData);
      } catch (error) {
        console.error("Error fetching stock price history:", error);
      }
    };
  
    fetchPortfolio();
  }, []);
  

  const calculateSummary = (data) => {
    const totalValue = data.reduce(
      (acc, stock) => acc + stock.currentPrice * stock.quantity,
      0
    );
    const totalInvestment = data.reduce(
      (acc, stock) => acc + stock.purchasePrice * stock.quantity,
      0
    );
    const profitLoss = totalValue - totalInvestment;
    const growthPercentage = (profitLoss / totalInvestment) * 100;
    const totalDividends = data.reduce(
      (acc, stock) =>
        acc + stock.quantity * stock.currentPrice * stock.dividendYield,
      0
    );

    setSummary({
      totalValue,
      totalInvestment,
      profitLoss,
      growthPercentage,
      totalDividends,
    });
  };

  const calculateDividendData = (data) => {
    const dividends = data.reduce((acc, stock) => {
      acc[stock.stockName] =
        (acc[stock.stockName] || 0) +
        stock.quantity * stock.currentPrice * stock.dividendYield;
      return acc;
    }, {});
    setDividendData(dividends);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  const filteredPortfolio = portfolio.filter(
    (stock) =>
      stock.stockName.toLowerCase().includes(filter.toLowerCase()) ||
      stock.ticker.toLowerCase().includes(filter.toLowerCase())
  );

  const handleStockSelection = (event) => {
    setSelectedStock(event.target.value);
  };


  const filteredTimelineData =
    selectedStock === ""
      ? timelineData 
      : stockPriceHistory.find((entry) => entry.ticker === selectedStock)
          ?.prices || [];


  // Chart Data
  const chartData = {
    labels: filteredTimelineData.map((entry) => {
      const dateObj = new Date(entry.timestamp);
      const formattedDate = dateObj.toLocaleDateString(); 
      const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); 
      return `${formattedDate}\n${formattedTime}`;
    }),
    datasets: [
      {
        label: `Portfolio Value (${selectedStock || "All Stocks"})`,
        data: filteredTimelineData.map(
          (entry) => (selectedStock === "" ? entry.value : entry.price)
        ),
        borderColor: "#42A5F5",
        fill: false,
      },
    ],
  };
  
  const handleExport = () => {
    if (!portfolio.length) {
      console.warn("No portfolio data to export.");
      return;
    }

    const csvHeaders =
      "Ticker,Stock Name,Quantity,Purchase Price,Current Price,Total Value\n";
    const csvRows = portfolio.map(
      (stock) =>
        `${stock.ticker},${stock.stockName},${stock.quantity},${
          stock.purchasePrice
        },${stock.currentPrice},${(stock.quantity * stock.currentPrice).toFixed(
          2
        )}`
    );
    const csvContent = [csvHeaders, ...csvRows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `portfolio_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleToggleView = () => {
    setTableView(!tableView);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PortfolioHeader
        onBuyClick={onBuyClick}
        onSellClick={onSellClick}
        onWatchlistClick={onWatchlistClick}
        onExportClick={handleExport}
      />

      {loading ? (
        <>
          {/* Skeletons for Cards */}
          <Grid2
            container
            spacing={3}
            sx={{ mb: 4 }}
            justifyContent="space-between"
            alignItems="stretch"
          >
            <Skeleton
              variant="rectangular"
              width="20%"
              height={120}
              animation="wave"
            />
            <Skeleton
              variant="rectangular"
              width="20%"
              height={120}
              animation="wave"
            />
            <Skeleton
              variant="rectangular"
              width="20%"
              height={120}
              animation="wave"
            />
            <Skeleton
              variant="rectangular"
              width="20%"
              height={120}
              animation="wave"
            />
          </Grid2>

          <Divider sx={{ mb: 4, mt: 4 }} />

          {/* Skeleton for Table */}
          <Grid2 item xs={12} sx={{ mb: 4 }}>
            <Skeleton variant="rectangular" height={400} animation="wave" />
          </Grid2>

          <Divider sx={{ mb: 4 }} />

          {/* Skeletons for Charts */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="stretch"
            sx={{ width: "100%" }}
          >
            <Skeleton
              variant="rectangular"
              width="48%"
              height={300}
              animation="wave"
            />
            <Skeleton
              variant="rectangular"
              width="48%"
              height={300}
              animation="wave"
            />
          </Box>
        </>
      ) : (
        <>
          <Grid2
            container
            spacing={3}
            sx={{ mb: 4 }}
            justifyContent="space-between"
          >
            {[
              {
                title: "Total Portfolio Value",
                value: `$${summary.totalValue.toFixed(2)}`,
                color: "primary",
                icon: <MonetizationOn sx={{ mr: 1 }} />,
              },
              {
                title: "Total Investment",
                value: `$${summary.totalInvestment.toFixed(2)}`,
                color: "secondary",
                icon: <AttachMoney sx={{ mr: 1 }} />,
              },
              {
                title: "Profit/Loss",
                value: `$${summary.profitLoss.toFixed(
                  2
                )} (${summary.growthPercentage.toFixed(2)}%)`,
                color: summary.profitLoss >= 0 ? "success" : "error",
                icon: <TrendingUp sx={{ mr: 1 }} />,
              },
              {
                title: "Total Dividends",
                value: `$${summary.totalDividends.toFixed(2)}`,
                color: "info",
                icon: <AccessTime sx={{ mr: 1 }} />,
              },
            ].map((item, index) => (
              <Grid2 item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": { transform: "scale(1.05)", boxShadow: 6 },
                    backgroundColor: "#ffffff",
                    boxShadow: 3,
                    borderRadius: 2,
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  <CardContent
                    sx={{
                      backgroundColor: (theme) =>
                        theme.palette[item.color].main,
                      color: "#ffffff",
                      textAlign: "center",
                      padding: "10px",
                    }}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {item.icon}
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: "bold", textTransform: "uppercase" }}
                      >
                        {item.title}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardContent
                    sx={{
                      textAlign: "center",
                      backgroundColor: "#ffffff",
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: "bold", color: "#333" }}
                    >
                      {item.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid2>
            ))}
          </Grid2>

          <Divider sx={{ mb: 4 }} />

          <Grid item xs={12} sx={{ mb: 4 }}>
            {/* Title with icon and filter */}
            <Grid
              container
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              {/* Title with Icon */}
              <Grid
                item
                xs={12}
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: (theme) => theme.palette.primary.main,
                    textTransform: "uppercase",
                    "&:hover": {
                      textShadow: "0px 2px 4px rgba(0, 0, 0, 0.3)",
                      cursor: "pointer",
                    },
                  }}
                >
                  <TableChartIcon sx={{ fontSize: 28 }} /> My Stocks
                </Typography>

                {/* Search Bar */}
                <TextField
                  label="Search Stocks"
                  variant="outlined"
                  size="small"
                  onChange={(e) => setFilter(e.target.value)}
                  value={filter}
                  sx={{
                    bgcolor: "#ffffff",
                    borderRadius: 1,
                    width: "30%",
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* View Switch */}
              <Grid
                item
                xs={12}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  Table View
                </Typography>
                <Switch
                  size="small"
                  checked={!tableView}
                  onChange={(e) => handleToggleView(e.target.checked)}
                  color="primary"
                />
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  Sliding View
                </Typography>
              </Grid>
            </Grid>

            {/* Conditional View */}
            {tableView ? (
              <>
                <TableContainer
                  component={Paper}
                  sx={{
                    borderRadius: 2,
                    boxShadow: 3,
                    "&:hover": { boxShadow: 6 },
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow
                        sx={{
                          backgroundColor: (theme) =>
                            theme.palette.primary.dark,
                        }}
                      >
                        <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                          Stock Name
                        </TableCell>
                        <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                          Symbol
                        </TableCell>
                        <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                          Quantity
                        </TableCell>
                        <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                          Purchase Price
                        </TableCell>
                        <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                          Current Price
                        </TableCell>
                        <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                          Total Value
                        </TableCell>
                        <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                          Profit/Loss
                        </TableCell>
                        <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                          Dividends
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredPortfolio.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            align="center"
                            sx={{ fontStyle: "italic" }}
                          >
                            No stocks to display.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPortfolio
                          .slice(
                            page * rowsPerPage,
                            page * rowsPerPage + rowsPerPage
                          )
                          .map((stock, index) => (
                            <TableRow
                              key={index}
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
                              <TableCell>
                                ${stock.purchasePrice.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                ${stock.currentPrice.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                $
                                {(stock.currentPrice * stock.quantity).toFixed(
                                  2
                                )}
                              </TableCell>
                              <TableCell
                                style={{
                                  color:
                                    stock.currentPrice >= stock.purchasePrice
                                      ? "green"
                                      : "red",
                                  fontWeight: "bold",
                                }}
                              >
                                $
                                {(
                                  (stock.currentPrice - stock.purchasePrice) *
                                  stock.quantity
                                ).toFixed(2)}
                              </TableCell>
                              <TableCell>
                                $
                                {(
                                  stock.quantity *
                                  stock.currentPrice *
                                  stock.dividendYield
                                ).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                {/* Pagination */}
                <TablePagination
                  rowsPerPageOptions={[5]}
                  component="div"
                  count={filteredPortfolio.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            ) : (
              <Slider {...sliderSettings}>
                {filteredPortfolio.map((stock, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "inline-block", // Ensures items stay inline
                      marginRight: "16px", // Space between cards
                    }}
                  >
                    <Card
                      sx={{
                        borderRadius: 2,
                        padding: 2,
                        borderRight: "2px solid black",
                        background: "linear-gradient(135deg, #ffffff, #f0f8ff)",
                        boxShadow: 3,
                        "&:hover": { boxShadow: 6, transform: "scale(1.05)" },
                        transition: "transform 0.3s ease",
                        minWidth: 250,
                      }}
                    >
                      {/* Header Section */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px",
                          backgroundColor: (() => {
                            const colors = [
                              "#FFC107", // Amber
                              "#FF9800", // Orange
                              "#8BC34A", // Light Green
                              "#2196F3", // Blue
                              "#9C27B0", // Purple
                              "#FF69B4", // Pink
                              "#03A9F4", // Cyan
                              "#FFA07A", // Coral
                              "#4CAF50", // Green
                            ];

                            return colors[
                              Math.floor(Math.random() * colors.length)
                            ];
                          })(),
                          borderRadius: "8px 8px 8px 8px",
                        }}
                      >
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color="white"
                        >
                          {stock.stockName}
                        </Typography>
                        <Chip
                          label={stock.ticker}
                          color="white"
                          variant="outlined"
                          sx={{
                            fontSize: 14,
                            fontWeight: "bold",
                            color: "white",
                            border: "2px solid",
                          }}
                        />
                      </Box>

                      {/* Content Section */}
                      <Box
                        sx={{
                          padding: "16px",
                          fontWeight: "bold",
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          Purchase Price: ${stock.purchasePrice.toFixed(2)}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: "bold",
                              mt: 1,
                              color:
                                stock.currentPrice >= stock.purchasePrice
                                  ? "green"
                                  : "red",
                            }}
                          >
                            Current Price: ${stock.currentPrice.toFixed(2)}
                          </Typography>

                          <Chip
                            icon={
                              stock.currentPrice >= stock.purchasePrice ? (
                                <TrendingUpIcon sx={{ color: "green" }} />
                              ) : (
                                <TrendingDownIcon sx={{ color: "red" }} />
                              )
                            }
                            label={`$${(
                              (stock.currentPrice - stock.purchasePrice) *
                              stock.quantity
                            ).toFixed(2)}`}
                            sx={{
                              fontSize: 14,
                              fontWeight: "bold",
                              backgroundColor:
                                stock.currentPrice >= stock.purchasePrice
                                  ? "#e8f5e9"
                                  : "#ffebee",
                              color:
                                stock.currentPrice >= stock.purchasePrice
                                  ? "green"
                                  : "red",
                              padding: "8px 12px",
                              "& .MuiChip-icon": {
                                marginLeft: 0,
                              },
                            }}
                          />
                        </Box>
                      </Box>
                    </Card>
                  </Box>
                ))}
              </Slider>
            )}
          </Grid>

          <Divider sx={{ mb: 4 }} />

          {/* Charts */}
          <Grid2 container spacing={3}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: (theme) => theme.palette.primary.main,
                textTransform: "uppercase",
                "&:hover": {
                  textShadow: "0px 2px 4px rgba(0, 0, 0, 0.3)",
                  cursor: "pointer",
                },
              }}
            >
              <TrendingUpIcon sx={{ marginRight: 1 }} /> Performance Trends
            </Typography>
            {/* Sector Allocation and Dividend Contribution */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="stretch"
              sx={{ width: "100%" }}
            >
              {/* Sector Allocation */}
              <Box
                flex={1}
                sx={{
                  maxWidth: "48%",
                  boxShadow: 6,
                  borderRadius: 3,
                  backgroundColor: "#1a237e",
                }}
              >
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        fontWeight: "bold",
                        color: "#fff",
                        padding: "12px 24px",
                        borderRadius: 2,
                        background: "linear-gradient(45deg, #3f51b5, #303f9f)",
                        textAlign: "center",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
                        "&:hover": {
                          background:
                            "linear-gradient(45deg, #303f9f, #3f51b5)",
                          cursor: "pointer",
                        },
                      }}
                    >
                      Sector Allocation
                    </Typography>

                    <Card
                      sx={{
                        backgroundColor: "#fff",
                        padding: 3,
                        borderRadius: 2,
                        boxShadow: 2,
                        mt: 2,
                      }}
                    >
                      <Pie
                        data={{
                          labels: Object.keys(sectorData),
                          datasets: [
                            {
                              data: Object.values(sectorData),
                              backgroundColor: [
                                "#FF6384",
                                "#36A2EB",
                                "#FFCE56",
                                "#4BC0C0",
                                "#FF9F40",
                              ],
                              borderWidth: 2,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: "top",
                              labels: {
                                font: { size: 14, weight: "bold" },
                                color: "#333",
                              },
                            },
                            tooltip: {
                              callbacks: {
                                label: (tooltipItem) =>
                                  `${
                                    tooltipItem.label
                                  }: $${tooltipItem.raw.toFixed(2)}`,
                              },
                            },
                          },
                        }}
                      />
                    </Card>
                  </CardContent>
                </Card>
              </Box>

              {/* Dividend Contribution */}
              <Box
                flex={1}
                sx={{
                  maxWidth: "48%",
                  boxShadow: 6,
                  borderRadius: 3,
                  backgroundColor: "#e8f5e9",
                }}
              >
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        fontWeight: "bold",
                        color: "#fff",
                        background: "linear-gradient(45deg, #66bb6a, #43a047)",
                        padding: "12px 24px",
                        borderRadius: 2,
                        textAlign: "center",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                        "&:hover": {
                          background:
                            "linear-gradient(45deg, #43a047, #66bb6a)",
                          cursor: "pointer",
                        },
                      }}
                    >
                      Dividend Contribution
                    </Typography>

                    <Card
                      sx={{
                        boxShadow: 2,
                        backgroundColor: "#fff",
                        padding: 3,
                        borderRadius: 2,
                        mt: 2,
                      }}
                    >
                      <Pie
                        data={{
                          labels: Object.keys(dividendData),
                          datasets: [
                            {
                              data: Object.values(dividendData),
                              backgroundColor: [
                                "#FF6384",
                                "#36A2EB",
                                "#FFCE56",
                                "#4BC0C0",
                                "#FF9F40",
                              ],
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: { position: "top" },
                            tooltip: {
                              callbacks: {
                                label: (tooltipItem) =>
                                  `${
                                    tooltipItem.label
                                  }: $${tooltipItem.raw.toFixed(2)}`,
                              },
                            },
                          },
                        }}
                      />
                    </Card>
                  </CardContent>
                </Card>
              </Box>
            </Box>

            {/* Portfolio Value Over Time */}
            <Grid2 item xs={12} sx={{ width: "100%" }}>
              <Card
                sx={{
                  boxShadow: 6,
                  borderRadius: 3,
                  backgroundColor: "#f5f5f5",
                  padding: 3,
                }}
              >
                {/* Header with Title and Filter */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 3,
                    padding: "12px 24px",
                    background: "linear-gradient(45deg, #1e88e5, #42a5f5)",
                    borderRadius: 2,
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  {/* Title */}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      color: "#fff",
                    }}
                  >
                    Portfolio Value Over Time
                  </Typography>

                  {/* Filter */}
                  <FormControl
                    sx={{
                      minWidth: 200,
                      backgroundColor: "#fff",
                      borderRadius: 2,
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "transparent",
                        },
                        "&:hover fieldset": {
                          borderColor: "#1e88e5",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#1e88e5",
                        },
                      },
                    }}
                  >
                    <InputLabel id="stock-select-label" sx={{ color: "#000" }}>
                      Select Stock
                    </InputLabel>
                    <Select
                      labelId="stock-select-label"
                      id="stock-select"
                      value={selectedStock}
                      onChange={handleStockSelection}
                      label="Select Stock"
                      sx={{
                        color: "#1e88e5",
                        fontWeight: "bold",
                        "& .MuiSelect-icon": {
                          color: "#1e88e5",
                        },
                      }}
                    >
                      <MenuItem value="" sx={{ color: "#1e88e5" }}>
                        All Stocks
                      </MenuItem>
                      {portfolio.map((stock) => (
                        <MenuItem key={stock.ticker} value={stock.ticker}>
                          {stock.ticker}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Chart */}
                <Card
                  sx={{
                    boxShadow: 6,
                    backgroundColor: "#fff",
                    padding: 3,
                    borderRadius: 2,
                    "&:hover": {
                      boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
                    },
                  }}
                >
                  <Line
                    data={chartData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: "top",
                          labels: {
                            font: {
                              size: 14,
                              weight: "bold",
                            },
                            color: "#333",
                          },
                        },
                        tooltip: {
                          callbacks: {
                            label: (tooltipItem) => {
                              return `Value: $${tooltipItem.raw.toFixed(2)}`;
                            },
                          },
                        },
                      },
                      scales: {
                        x: {
                          grid: {
                            display: false,
                          },
                          title: {
                            display: true,
                            text: "Date",
                          },
                        },
                        y: {
                          ticks: {
                            beginAtZero: true,
                          },
                          grid: {
                            borderColor: "#ddd",
                          },
                          title: {
                            display: true,
                            text: "Portfolio Value",
                          },
                        },
                      },
                    }}
                  />
                </Card>
              </Card>
            </Grid2>

            {/* Profit/Loss Heatmap */}
            <Grid2 item xs={12} sx={{ width: "100%" }}>
              <Card
                sx={{
                  boxShadow: 6,
                  borderRadius: 3,
                  backgroundColor: "#f3e5f5",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: "bold",
                      color: "#fff",
                      background: "linear-gradient(45deg, #ab47bc, #8e24aa)",
                      padding: "12px 24px",
                      borderRadius: 2,
                      textAlign: "center",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                      "&:hover": {
                        background: "linear-gradient(45deg, #8e24aa, #ab47bc)",
                        cursor: "pointer",
                      },
                    }}
                  >
                    Stock Performance Heatmap
                  </Typography>

                  <Card
                    sx={{
                      boxShadow: 6,
                      backgroundColor: "#f9f9f9",
                      padding: 3,
                      borderRadius: 2,
                      mt: 2,
                      "&:hover": {
                        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
                      },
                    }}
                  >
                    <Bar
                      data={{
                        labels: portfolio.map((stock) => stock.stockName),
                        datasets: [
                          {
                            label: "Profit/Loss",
                            data: portfolio.map(
                              (stock) =>
                                (stock.currentPrice - stock.purchasePrice) *
                                stock.quantity
                            ),
                            backgroundColor: portfolio.map((stock) =>
                              stock.currentPrice >= stock.purchasePrice
                                ? "#4CAF50"
                                : "#F44336"
                            ),
                            borderRadius: 5,
                            borderSkipped: false,
                            borderWidth: 2,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: "top",
                            labels: {
                              font: {
                                size: 14,
                                weight: "bold",
                              },
                              color: "#333",
                            },
                          },
                          tooltip: {
                            callbacks: {
                              label: (tooltipItem) => {
                                return `${
                                  tooltipItem.label
                                }: $${tooltipItem.raw.toFixed(2)}`;
                              },
                            },
                          },
                        },
                      }}
                    />
                  </Card>
                </CardContent>
              </Card>
            </Grid2>

            {/* Profit/Loss Trend */}
            <Grid2 item xs={12} sx={{ width: "100%" }}>
              <Card
                sx={{
                  boxShadow: 6,
                  borderRadius: 3,
                  backgroundColor: "#f5f5f5",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: "bold",
                      color: "#fff",
                      background: "linear-gradient(45deg, #1e88e5, #42a5f5)",
                      padding: "12px 24px",
                      borderRadius: 2,
                      textAlign: "center",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                      "&:hover": {
                        background: "linear-gradient(45deg, #42a5f5, #1e88e5)",
                        cursor: "pointer",
                      },
                    }}
                  >
                    Profit/Loss Trend
                  </Typography>

                  <Card
                    sx={{
                      boxShadow: 6,
                      backgroundColor: "#fff",
                      padding: 3,
                      borderRadius: 2,
                      mt: 2,
                      "&:hover": {
                        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
                      },
                    }}
                  >
                    <Line
                      data={{
                        labels: portfolio.map((stock) => stock.stockName),
                        datasets: [
                          {
                            label: "Profit/Loss",
                            data: portfolio.map(
                              (stock) =>
                                (stock.currentPrice - stock.purchasePrice) *
                                stock.quantity
                            ),
                            borderColor: "#42A5F5",
                            backgroundColor: "rgba(66, 165, 245, 0.2)",
                            fill: true,
                            borderWidth: 3,
                            tension: 0.4,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: "top",
                            labels: {
                              font: {
                                size: 14,
                                weight: "bold",
                              },
                              color: "#333",
                            },
                          },
                          tooltip: {
                            callbacks: {
                              label: (tooltipItem) => {
                                return `${
                                  tooltipItem.label
                                }: $${tooltipItem.raw.toFixed(2)}`;
                              },
                            },
                          },
                        },
                        scales: {
                          x: {
                            grid: {
                              display: false,
                            },
                          },
                          y: {
                            ticks: {
                              beginAtZero: true,
                            },
                            grid: {
                              borderColor: "#ddd",
                            },
                          },
                        },
                      }}
                    />
                  </Card>
                </CardContent>
              </Card>
            </Grid2>
          </Grid2>
        </>
      )}
    </Container>
  );
};

PortfolioComponent.propTypes = {
  onBuyClick: PropTypes.func.isRequired,
  onSellClick: PropTypes.func.isRequired,
  onWatchlistClick: PropTypes.func.isRequired,
  onExportClick: PropTypes.func.isRequired,
};

export default PortfolioComponent;
