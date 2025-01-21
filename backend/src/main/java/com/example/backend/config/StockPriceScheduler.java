package com.example.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import com.example.backend.service.StockPriceService;
import com.example.backend.service.PortfolioValueService;

@Configuration
@EnableScheduling
public class StockPriceScheduler {

    @Autowired
    private StockPriceService stockPriceService;

    @Autowired
    private PortfolioValueService portfolioValueService;

    @Scheduled(fixedRate = 60000) // Runs every hour
    public void updateStockPricesAndPortfolioValues() {
        stockPriceService.generateStockPrices();
        updateAllPortfolios();
    }

    private void updateAllPortfolios() {
        var userIds = stockPriceService.getAllUserIds(); 
        for (Long userId : userIds) {
            portfolioValueService.updatePortfolioValue(userId);
        }
    }
}
