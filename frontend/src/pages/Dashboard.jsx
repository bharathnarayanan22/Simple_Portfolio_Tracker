import React, { useState, useEffect } from "react";
import axios from "axios";

const Dashboard = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_KEY = "09K7OD6H64SYL5A5"; // Replace with your Alpha Vantage API key
  const REFRESH_INTERVAL = 60000; // Fetch data every 60 seconds (adjust as needed)

  const fetchStockData = async () => {
    try {
      setLoading(true);

      // Step 1: Define stock symbols (you can update this list or fetch dynamically)
      const symbols = ["AAPL", "MSFT", "GOOG", "AMZN", "TSLA"];
      const promises = symbols.map((symbol) =>
        axios.get(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
        )
      );

      // Step 2: Resolve all API calls
      const responses = await Promise.all(promises);

      // Step 3: Extract data
      const stockData = responses.map((response) => {
        const data = response.data["Global Quote"];
        return {
          symbol: data["01. symbol"],
          price: parseFloat(data["05. price"]).toFixed(2),
          volume: data["06. volume"],
          change: data["09. change"],
          changePercent: data["10. change percent"],
        };
      });

      setStocks(stockData);
      setError(null); // Clear any previous error
    } catch (err) {
      console.error(err);
      setError("Failed to fetch stock data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data immediately on component load
    fetchStockData();

    // Set up interval to fetch data periodically
    const interval = setInterval(fetchStockData, REFRESH_INTERVAL);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Stock Dashboard</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && (
        <table border="1" cellPadding="10" cellSpacing="0" style={{ marginTop: "20px", width: "100%", textAlign: "left" }}>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Price</th>
              <th>Volume</th>
              <th>Change</th>
              <th>Change (%)</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock, index) => (
              <tr key={index}>
                <td>{stock.symbol}</td>
                <td>${stock.price}</td>
                <td>{stock.volume}</td>
                <td style={{ color: stock.change >= 0 ? "green" : "red" }}>
                  {stock.change}
                </td>
                <td style={{ color: stock.changePercent.includes("+") ? "green" : "red" }}>
                  {stock.changePercent}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Dashboard;
