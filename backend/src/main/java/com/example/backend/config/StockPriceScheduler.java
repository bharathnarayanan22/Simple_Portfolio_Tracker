package com.example.backend.config;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import com.example.backend.service.StockPriceService;

@Configuration
@EnableScheduling
public class StockPriceScheduler {

    @Autowired
    private StockPriceService stockPriceService;

    @Scheduled(fixedRate = 3600000) 
    public void updateStockPrices() {
        stockPriceService.generateStockPrices();
    }
}
