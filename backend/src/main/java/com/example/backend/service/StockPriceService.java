package com.example.backend.service;

import com.example.backend.model.Stock;
import com.example.backend.model.StockPrice;
import com.example.backend.repository.StockPriceRepository;
import com.example.backend.repository.StockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;

@Service
public class StockPriceService {

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private StockPriceRepository stockPriceRepository;


    public void generateStockPrices() {
        List<Stock> stocks = stockRepository.findAll();
        for (Stock stock : stocks) {
            StockPrice stockPrice = new StockPrice();
            stockPrice.setStock(stock);

            // Use the current stock price or simulate a slight variation
            double randomChange = stock.getPrice() * (Math.random() * 0.05 - 0.025); // ±2.5% random change
            double newPrice = Math.max(stock.getPrice() + randomChange, 0); // Ensure price is not negative
            stockPrice.setPrice(newPrice);

            // Set the current timestamp
            stockPrice.setTimestamp(new Timestamp(System.currentTimeMillis()));

            // Save to the stock_prices table
            stockPriceRepository.save(stockPrice);
            stock.setPrice(newPrice);
            stockRepository.save(stock);
        }
    }

    // Fetch price history for a specific stock
    public List<StockPrice> getPriceHistory(Long stockId) {
        return stockPriceRepository.findByStockIdOrderByTimestampDesc(stockId);
    }


    // Fetch the latest price for a specific stock
    public StockPrice getLatestPrice(Long stockId) {
        return stockPriceRepository.findTopByStockIdOrderByTimestampDesc(stockId)
                .orElseThrow(() -> new IllegalArgumentException("No prices found for stock with ID: " + stockId));
    }
}
