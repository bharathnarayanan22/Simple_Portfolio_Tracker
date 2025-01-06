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
} from "@mui/material";
import axios from "axios";
import ReceiptIcon from "@mui/icons-material/Receipt"; 
import DownloadIcon from "@mui/icons-material/Download";


const TransactionsComponent = () => {
  const [transactions, setTransactions] = useState([]);
  const [funds, setFunds] = useState(0);
  const [fundsSpent, setFundsSpent] = useState(0);
  const [fundsGained, setFundsGained] = useState(0);
  const [increaseFundsModalOpen, setIncreaseFundsModalOpen] = useState(false);
  const [increaseAmount, setIncreaseAmount] = useState(0);
  const userId = localStorage.getItem("userId");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fundsResponse, transactionsResponse] = await Promise.all([
          axios.get(`http://localhost:8080/api/users/${userId}/funds`),
          axios.get(`http://localhost:8080/api/users/${userId}/transactions`),
        ]);

        setFunds(fundsResponse.data);
        setTransactions(transactionsResponse.data);

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
      }
    };

    fetchData();
  }, [userId]);

  const handleIncreaseFunds = async () => {
    if (increaseAmount > 0) {
      try {
        await axios.post(
          `http://localhost:8080/api/users/${userId}/addFunds?amount=${increaseAmount}`
        );
        setFunds(funds + increaseAmount);
        alert(`Funds increased by $${increaseAmount.toFixed(2)}`);
        setIncreaseFundsModalOpen(false);
        setIncreaseAmount(0);
      } catch (error) {
        console.error("Error increasing funds:", error);
        alert("Failed to increase funds.");
      }
    } else {
      alert("Enter a valid amount.");
    }
  };

  const handleExport = () => {
    const csvContent = [
      ["Action", "Stock Name", "Ticker", "Quantity", "Price", "Amount", "Date", "Time"],
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

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when rows per page change
  };

  // Calculate the data for the current page
  const paginatedTransactions = transactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );



  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
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
          <Tooltip title="Download your Transcations history as a CSV file" arrow></Tooltip>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            color="primary"
            onClick={handleExport}
            sx={{
              fontWeight: "bold",
              boxShadow: 3,
              textTransform: "uppercase",
            }}
          >
            Export CSV
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        {[
          {
            title: "Available Funds",
            value: `$${funds.toFixed(2)}`,
          },
          {
            title: "Total Funds Spent",
            value: `$${fundsSpent.toFixed(2)}`,
          },
          {
            title: "Total Funds Gained",
            value: `$${fundsGained.toFixed(2)}`,
          },
        ].map((card, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Card
              sx={{
                boxShadow: 3,
                borderRadius: 2,
                transition: "0.3s",
                "&:hover": { boxShadow: 6 },
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="h5" color="primary">
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              boxShadow: 3,
              borderRadius: 2,
              textAlign: "center",
              transition: "0.3s",
              "&:hover": {
                boxShadow: 6,
                backgroundColor: "primary.main", // Change card background to primary
                "& .MuiButton-root": {
                  // Button hover effect inside the card
                  backgroundColor: "white",
                  color: "primary.main",
                },
                "& .MuiTypography-root": {
                  // Change typography color on hover
                  color: "white",
                },
              },
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: "text.primary" }}
              >
                Increase Funds
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setIncreaseFundsModalOpen(true)}
                sx={{
                  width: "100%",
                  fontWeight: "bold",
                  transition: "0.3s",
                  "&:hover": {
                    backgroundColor: "white",
                    color: "primary.main",
                  },
                }}
              >
                Add Funds
              </Button>
            </CardContent>
          </Card>
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
            {paginatedTransactions.map((transaction) => (
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
            ))}
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
    </Container>
  );
};

export default TransactionsComponent;
