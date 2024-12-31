export const generateMockStocks = () => {
    const symbols = ["AAPL", "GOOG", "MSFT", "AMZN", "TSLA"];
    return symbols.map((symbol) => ({
      symbol,
      price: (Math.random() * 2000 + 100).toFixed(2), // Random price between $100-$2100
      volume: Math.floor(Math.random() * 1000000), // Random volume
      change: ((Math.random() - 0.5) * 10).toFixed(2), // Random change (-5 to +5)
      percentChange: ((Math.random() - 0.5) * 2).toFixed(2), // Random % change (-1% to +1%)
    }));
  };
  
  export const updateStockPrices = (stocks) => {
    return stocks.map((stock) => {
      const change = (Math.random() - 0.5) * 10; // Simulate random price change
      const newPrice = parseFloat(stock.price) + change;
      return {
        ...stock,
        price: newPrice.toFixed(2),
        change: change.toFixed(2),
        percentChange: ((change / stock.price) * 100).toFixed(2),
      };
    });
  };
  