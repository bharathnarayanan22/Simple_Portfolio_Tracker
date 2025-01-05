import React, { useEffect, useState } from "react";
import PortfolioButtons from "./PortfolioButtons";
import {
  Container,
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
} from "@mui/material";
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

ChartJS.register(
  ArcElement,
  ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement
);
import { format } from "date-fns";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PropTypes from "prop-types"; // Import PropTypes


const PortfolioComponent = ({ onBuyClick, onSellClick, onWatchlistClick, onExportClick }) => {
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

  const sectorMap = {
    Tech: ["AAPL", "MSFT", "GOOG"],
    Healthcare: ["JNJ", "PFE", "MRK"],
    Finance: ["JPM", "GS", "C", "BAC"],
    Energy: ["XOM", "CVX", "SLB"],
    Consumer: ["DIS", "KO", "MCD"],
  };

  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);

      const userId = localStorage.getItem("userId");
      try {
        // Step 1: Fetch portfolio data
        const portfolioResponse = await axios.get(
          `http://localhost:8080/api/users/${userId}/portfolio`
        );
        const portfolioData = portfolioResponse.data;

        // Step 2: Fetch all stocks
        const allStocksResponse = await axios.get(
          "http://localhost:8080/stocks"
        );
        const allStocks = allStocksResponse.data;

        // Step 3: Match portfolio stocks with all stocks
        const matchedPortfolio = portfolioData.map((portfolioStock) => {
          const stockDetails = allStocks.find(
            (stock) => stock.ticker === portfolioStock.ticker
          );

          if (stockDetails) {
            return {
              ...portfolioStock,
              stockId: stockDetails.id, // Use stock's id for fetching history
              currentPrice: stockDetails.price,
              sector: stockDetails.sector || "Unknown",
              dividendYield: Math.random() * 0.05, // Example data
            };
          } else {
            return {
              ...portfolioStock,
              currentPrice: portfolioStock.purchasePrice, // Fallback if no match
            };
          }
        });

        const newSectorData = calculateSectorData(matchedPortfolio);
        setSectorData(newSectorData);

        // Step 4: Fetch price history for matched stocks
        const portfolioTimeline = await fetchTimelineData(matchedPortfolio);

        // Update state with processed data
        setPortfolio(matchedPortfolio);
        setTimelineData(portfolioTimeline);
        calculateSummary(matchedPortfolio);
        // calculateSectorData(matchedPortfolio);
        calculateDividendData(matchedPortfolio);
      } catch (error) {
        console.error("Error fetching portfolio or stocks:", error);
      } finally {
        setLoading(false);
      }
    };

    const sectorMap = {
      Tech: ["AAPL", "MSFT", "GOOG"],
      Healthcare: ["JNJ", "PFE", "MRK"],
      Finance: ["JPM", "GS", "C", "BAC"],
      Energy: ["XOM", "CVX", "SLB"],
      Consumer: ["DIS", "KO", "MCD"],
    };

    const calculateSectorData = (portfolio) => {
      const sectorData = {};

      portfolio.forEach((stock) => {
        // Find the sector based on the sectorMap
        let sector = "Other"; // Default sector if no match
        for (const [key, tickers] of Object.entries(sectorMap)) {
          if (tickers.includes(stock.ticker)) {
            sector = key;
            break;
          }
        }

        // Calculate the value for the stock in the corresponding sector
        const value = stock.currentPrice * stock.quantity;

        // Add the value to the sector's total
        if (sectorData[sector]) {
          sectorData[sector] += value;
        } else {
          sectorData[sector] = value;
        }
      });

      return sectorData;
    };

    const fetchTimelineData = async (portfolio) => {
      const timelineData = [];

      for (const stock of portfolio) {
        try {
          // Fetch price history using stockId
          const response = await axios.get(
            `http://localhost:8080/api/stockPrices/history/${stock.stockId}`
          );
          const stockPriceHistory = response.data;

          stockPriceHistory.forEach((priceData) => {
            const date = priceData.timestamp; // Use timestamp as date
            const valueAtDate = stock.quantity * priceData.price;

            const existingEntry = timelineData.find(
              (entry) => entry.date === date
            );

            if (existingEntry) {
              existingEntry.value += valueAtDate;
            } else {
              timelineData.push({ date, value: valueAtDate });
            }
          });
        } catch (error) {
          console.error(
            `Error fetching price history for stock ${stock.stockId}:`,
            error
          );
        }
      }

      // Sort timeline data by date
      timelineData.sort((a, b) => new Date(a.date) - new Date(b.date));
      return timelineData;
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

  // const calculateSectorData = (data) => {
  //   const sectors = data.reduce((acc, stock) => {
  //     acc[stock.sector] =
  //       (acc[stock.sector] || 0) + stock.currentPrice * stock.quantity;
  //     return acc;
  //   }, {});
  //   setSectorData(sectors);
  // };

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

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  const filteredPortfolio = portfolio.filter(
    (stock) =>
      stock.stockName.toLowerCase().includes(filter.toLowerCase()) ||
      stock.ticker.toLowerCase().includes(filter.toLowerCase())
  );

  const chartData = {
    labels: timelineData.map((entry) =>
      format(new Date(entry.date), "dd-MM-yyyy")
    ), // Format the date
    datasets: [
      {
        label: "Portfolio Value Over Time",
        data: timelineData.map((entry) => entry.value),
        borderColor: "#42A5F5",
        fill: false,
      },
    ],
  };


  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PortfolioHeader 
        onBuyClick={onBuyClick}
        onSellClick={onSellClick}
        onWatchlistClick={onWatchlistClick}
        onExportClick={onExportClick} />

      {loading ? (
        <CircularProgress />
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

          <Grid2 item xs={12} sx={{ mb: 4 }}>
            {/* Title with icon and filter */}
            <Grid2 container justifyContent="space-between" alignItems="center">
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

              {/* Filter TextField aligned to the right */}
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search stocks"
                sx={{
                  ml: 1,
                  width: 300,
                  marginBottom: 1,
                }}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </Grid2>

            {/* Styled Table */}
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
                      backgroundColor: (theme) => theme.palette.primary.dark,
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
                  {filteredPortfolio
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
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
                        <TableCell>${stock.purchasePrice.toFixed(2)}</TableCell>
                        <TableCell>${stock.currentPrice.toFixed(2)}</TableCell>
                        <TableCell>
                          {(stock.currentPrice * stock.quantity).toFixed(2)}
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
                    ))}
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
          </Grid2>

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
                        boxShadow: 6,
                        backgroundColor: "#eeeeee",
                        padding: 3,
                        borderRadius: 2,
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
                        boxShadow: 6,
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
                    Portfolio Value Over Time
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
                </CardContent>
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
