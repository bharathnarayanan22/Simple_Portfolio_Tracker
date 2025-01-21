import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Modal,
  TextField,
  Container,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TablePagination,
  Tooltip,
  Skeleton,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  InputAdornment,
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import SearchIcon from "@mui/icons-material/Search";
import ReceiptIcon from "@mui/icons-material/Receipt";
import DownloadIcon from "@mui/icons-material/Download";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PaidIcon from "@mui/icons-material/Paid";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TransactionsComponent = () => {
  const [transactions, setTransactions] = useState([]);
  const [funds, setFunds] = useState(0);
  const [fundsSpent, setFundsSpent] = useState(0);
  const [fundsGained, setFundsGained] = useState(0);
  const [increaseFundsModalOpen, setIncreaseFundsModalOpen] = useState(false);
  const [increaseAmount, setIncreaseAmount] = useState(0);
  const userId = localStorage.getItem("userId");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fundsResponse, transactionsResponse] = await Promise.all([
          axios.get(`https://simple-portfolio-tracker-1-durb.onrender.com/api/users/${userId}/funds`),
          axios.get(`https://simple-portfolio-tracker-1-durb.onrender.com/api/users/${userId}/transactions`),
        ]);

        setFunds(fundsResponse.data);
        setTransactions(transactionsResponse.data);
        setFilteredTransactions(transactionsResponse.data);
        const spent = transactionsResponse.data
          .filter((t) => t.action === "BUY")
          .reduce((total, t) => total + t.amount, 0);
        const gained = transactionsResponse.data
          .filter((t) => t.action === "SELL")
          .reduce((total, t) => total + t.amount, 0);

        setFundsSpent(spent);
        setFundsGained(gained);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...transactions];

      if (searchText) {
        filtered = filtered.filter((transaction) =>
          transaction.stockName.toLowerCase().includes(searchText.toLowerCase())
        );
      }
      if (actionFilter) {
        filtered = filtered.filter(
          (transaction) => transaction.action === actionFilter
        );
      }
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        filtered = filtered.filter(
          (transaction) =>
            new Date(transaction.date) >= start &&
            new Date(transaction.date) <= end
        );
      }

      setFilteredTransactions(filtered); 
    };

    applyFilters();
  }, [searchText, actionFilter, startDate, endDate, transactions]);

  const handleSearchChange = (e) => {
    const searchValue = e.target.value;
    setSearchText(searchValue);
    applyFilters(searchValue, actionFilter, startDate, endDate);
  };

  const handleFilterChange = (e) => {
    const action = e.target.value;
    setActionFilter(action);
    applyFilters(searchText, action, startDate, endDate);
  };

  const handleDateChange = (field, value) => {
    if (field === "start") {
      setStartDate(value);
      applyFilters(searchText, actionFilter, value, endDate);
    } else if (field === "end") {
      setEndDate(value);
      applyFilters(searchText, actionFilter, startDate, value);
    }
  };

  const handleIncreaseFunds = async () => {
    if (increaseAmount > 0) {
      try {
        await axios.post(
          `https://simple-portfolio-tracker-1-durb.onrender.com/api/users/${userId}/addFunds?amount=${increaseAmount}`
        );
        setFunds(funds + increaseAmount);
        toast.success(`Funds increased by $${increaseAmount.toFixed(2)}`);
        setIncreaseFundsModalOpen(false);
        setIncreaseAmount(0);
      } catch (error) {
        console.error("Error increasing funds:", error);
        toast.error("Failed to increase funds.");
      }
    } else {
      alert("Enter a valid amount.");
    }
  };

  const handleExport = () => {
    const csvContent = [
      [
        "Action",
        "Stock Name",
        "Ticker",
        "Quantity",
        "Price",
        "Amount",
        "Date",
        "Time",
      ],
      ...transactions.map((transaction) => [
        transaction.action,
        transaction.stockName,
        transaction.ticker,
        transaction.quantity,
        transaction.price.toFixed(2),
        transaction.amount.toFixed(2),
        new Date(transaction.date).toLocaleDateString(),
        new Date(transaction.date).toLocaleTimeString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedTransactions = filteredTransactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid
        container
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 4 }}
      >
        <Grid item>
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
            <ReceiptIcon sx={{ mr: 1, fontSize: "2rem", color: "#6A5ACD" }} />
            Transactions
          </Typography>
        </Grid>
        <Grid item>
          <Tooltip
            title="Download your Transactions history as a CSV file"
            arrow
          >
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              color="primary"
              onClick={handleExport}
              sx={{
                fontWeight: "bold",
                boxShadow: 3,
                textTransform: "uppercase",
                mr: 2,
              }}
            >
              Export CSV
            </Button>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            color="primary"
            onClick={() => setIncreaseFundsModalOpen(true)}
            sx={{
              fontWeight: "bold",
              boxShadow: 3,
              textTransform: "uppercase",
              "&:hover": {
                background: "secondary",
              },
            }}
          >
            Increase Funds
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        {[
          {
            title: "Available Funds",
            value: `$${funds.toFixed(2)}`,
            titleBg: "linear-gradient(45deg, #3f51b5, #2196f3)",
            contentBg: "#f5f5f5",
            icon: <AccountBalanceWalletIcon fontSize="large" />,
          },
          {
            title: "Total Funds Spent",
            value: `$${fundsSpent.toFixed(2)}`,
            titleBg: "linear-gradient(45deg, #ff5722, #f44336)",
            contentBg: "#f5f5f5",
            icon: <PaidIcon fontSize="large" />,
          },
          {
            title: "Total Funds Gained",
            value: `$${fundsGained.toFixed(2)}`,
            titleBg: "linear-gradient(45deg, #4caf50, #8bc34a)",
            contentBg: "#f5f5f5",
            icon: <TrendingUpIcon fontSize="large" />,
          },
        ].map((card, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Card
              sx={{
                boxShadow: 3,
                borderRadius: 2,
                transition: "0.3s",
                "&:hover": { boxShadow: 6, transform: "translateY(-5px)" },
              }}
            >
              <CardContent
                sx={{
                  p: 0,
                  "&:last-child": { pb: 0 },
                }}
              >
                <Box
                  sx={{
                    background: card.titleBg,
                    color: "white",
                    p: 1.5,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    gap: 1,
                  }}
                >
                  {card.icon}
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: "bold", mt: 1 }}
                  >
                    {card.title}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    background: card.contentBg,
                    p: 3,
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="h5"
                    color="text.primary"
                    sx={{ fontWeight: "bold" }}
                  >
                    {card.value}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid
        container
        spacing={2}
        sx={{
          mb: 4,
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        {/* Search Field */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            onChange={handleSearchChange}
            value={searchText}
            sx={{
              bgcolor: "#ffffff", 
              borderRadius: 1,
              width: "100%"
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

        {/* Filter by Action */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl
            fullWidth
            size="small"
            sx={{
              bgcolor: "#ffffff", 
              borderRadius: 1,
            }}
          >
            <InputLabel>Action</InputLabel>
            <Select
              value={actionFilter}
              onChange={handleFilterChange}
              label="Action"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="BUY">BUY</MenuItem>
              <MenuItem value="SELL">SELL</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Filter by Start Date */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            size="small"
            type="date"
            label="Start Date"
            InputLabelProps={{ shrink: true }}
            value={startDate ? dayjs(startDate).format("YYYY-MM-DD") : ""}
            onChange={(e) => handleDateChange("start", e.target.value)}
            fullWidth
            sx={{
              bgcolor: "#ffffff", // White background
              borderRadius: 1,
            }}
          />
        </Grid>

        {/* Filter by End Date */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            size="small"
            type="date"
            label="End Date"
            InputLabelProps={{ shrink: true }}
            value={endDate ? dayjs(endDate).format("YYYY-MM-DD") : ""}
            onChange={(e) => handleDateChange("end", e.target.value)}
            fullWidth
            sx={{
              bgcolor: "#ffffff", // White background
              borderRadius: 1,
            }}
          />
        </Grid>
      </Grid>

      {/* Transactions Table */}
      <TableContainer
        component={Paper}
        sx={{ boxShadow: 3, borderRadius: 2, "&:hover": { boxShadow: 6 } }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: (theme) => theme.palette.primary.dark,
              }}
            >
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                <strong>Action</strong>
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                <strong>Stock Name</strong>
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                <strong>Ticker</strong>
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                <strong>Quantity</strong>
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                <strong>Price</strong>
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                <strong>Amount</strong>
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                <strong>Date</strong>
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                <strong>Time</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={8}>
                    <Skeleton animation="wave" height={50} />
                  </TableCell>
                </TableRow>
              ))
            ) : paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="h6" color="textSecondary">
                    No Past Transcations.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  sx={{
                    borderLeft:
                      transaction.action === "BUY"
                        ? "5px solid red"
                        : transaction.action === "SELL"
                        ? "5px solid green"
                        : "none",
                    "&:nth-of-type(odd)": {
                      backgroundColor: (theme) => theme.palette.action.hover,
                    },
                    "&:hover": {
                      backgroundColor: (theme) => theme.palette.action.selected,
                      cursor: "pointer",
                    },
                  }}
                >
                  <TableCell>{transaction.action}</TableCell>
                  <TableCell>{transaction.stockName}</TableCell>
                  <TableCell>{transaction.ticker}</TableCell>
                  <TableCell>{transaction.quantity}</TableCell>
                  <TableCell>${transaction.price.toFixed(2)}</TableCell>
                  <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    {new Date(transaction.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(transaction.date).toLocaleTimeString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={10}
        component="div"
        count={transactions.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Increase Funds Modal */}
      <Modal
        open={increaseFundsModalOpen}
        onClose={() => setIncreaseFundsModalOpen(false)}
        aria-labelledby="increase-funds-modal"
        aria-describedby="modal-to-increase-funds"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            width: { xs: "90%", sm: "400px" },
            maxWidth: "90%",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Increase Funds
          </Typography>
          <TextField
            label="Enter Amount"
            type="number"
            fullWidth
            variant="outlined"
            value={increaseAmount}
            onChange={(e) => setIncreaseAmount(Number(e.target.value))}
            sx={{ mb: 3 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleIncreaseFunds}
            fullWidth
            sx={{ fontWeight: "bold" }}
          >
            Add Funds
          </Button>
        </Box>
      </Modal>
      <ToastContainer />
    </Container>
  );
};

export default TransactionsComponent;
