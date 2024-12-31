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
} from "@mui/material";
import axios from "axios";

const TransactionsComponent = () => {
  const [transactions, setTransactions] = useState([]);
  const [funds, setFunds] = useState(0);
  const [fundsSpent, setFundsSpent] = useState(0);
  const [fundsGained, setFundsGained] = useState(0);
  const [increaseFundsModalOpen, setIncreaseFundsModalOpen] = useState(false);
  const [increaseAmount, setIncreaseAmount] = useState(0);
  const userId = localStorage.getItem("userId");

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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
      <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "primary.main" }}>
              <TableCell sx={{ color: "white" }}>
                <strong>Action</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Stock Name</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Ticker</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Quantity</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Price</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Amount</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Date</strong>
              </TableCell>
              <TableCell sx={{ color: "white" }}>
                <strong>Time</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow
                key={transaction.id}
                sx={{
                  borderLeft:
                    transaction.action === "BUY"
                      ? "5px solid red"
                      : transaction.action === "SELL"
                      ? "5px solid green"
                      : "none",
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
