package com.example.backend.controller;

import com.example.backend.model.StockPrice;
import com.example.backend.service.StockPriceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;


@RestController
@RequestMapping("/api/stockPrices")
public class StockPriceController {

    @Autowired
    private StockPriceService stockPriceService;

    // Get price history for a specific stock
    @GetMapping("/history/{stockId}")
    public List<StockPrice> getPriceHistory(@PathVariable Long stockId) {
        return stockPriceService.getPriceHistory(stockId);
    }

    // Get the latest price for a specific stock
    @GetMapping("/latest/{stockId}")
    public StockPrice getLatestPrice(@PathVariable Long stockId) {
        return stockPriceService.getLatestPrice(stockId);
    }

    @PostMapping("/generate")
    public String generateStockPrices() {
        stockPriceService.generateStockPrices();
        return "Stock prices generated successfully!";
    }
}