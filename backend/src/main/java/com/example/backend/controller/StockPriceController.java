package com.example.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.model.StockPrice;
import com.example.backend.service.StockPriceService;


@RestController
@RequestMapping("/api/stockPrices")
public class StockPriceController {

    @Autowired
    private StockPriceService stockPriceService;

    @GetMapping("/history/{stockId}")
    public List<StockPrice> getPriceHistory(@PathVariable Long stockId) {
        return stockPriceService.getPriceHistory(stockId);
    }

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