package com.example.backend.service;

import java.sql.Timestamp;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.model.Stock;
import com.example.backend.model.StockPrice;
import com.example.backend.repository.StockPriceRepository;
import com.example.backend.repository.StockRepository;

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

            double randomChange = stock.getPrice() * (Math.random() * 0.05 - 0.025); 
            double newPrice = Math.max(stock.getPrice() + randomChange, 0); 
            stockPrice.setPrice(newPrice);

            stockPrice.setTimestamp(new Timestamp(System.currentTimeMillis()));

            stockPriceRepository.save(stockPrice);
            stock.setPrice(newPrice);
            stockRepository.save(stock);
        }
    }

    public List<StockPrice> getPriceHistory(Long stockId) {
        return stockPriceRepository.findByStockIdOrderByTimestampDesc(stockId);
    }

    public StockPrice getLatestPrice(Long stockId) {
        return stockPriceRepository.findTopByStockIdOrderByTimestampDesc(stockId)
                .orElseThrow(() -> new IllegalArgumentException("No prices found for stock with ID: " + stockId));
    }
}
