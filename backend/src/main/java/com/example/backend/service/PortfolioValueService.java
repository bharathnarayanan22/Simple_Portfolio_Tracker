package com.example.backend.service;

import com.example.backend.model.PortfolioValue;
import com.example.backend.model.StockPrice;
import com.example.backend.repository.PortfolioValueRepository;
import com.example.backend.repository.StockPriceRepository;
import com.example.backend.repository.UserStockRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PortfolioValueService {

    private final PortfolioValueRepository portfolioValueRepository;
    private final UserStockRepository userStockRepository;
    private final StockPriceRepository stockPriceRepository;

    public PortfolioValueService(PortfolioValueRepository portfolioValueRepository,
            UserStockRepository userStockRepository,
            StockPriceRepository stockPriceRepository) {
        this.portfolioValueRepository = portfolioValueRepository;
        this.userStockRepository = userStockRepository;
        this.stockPriceRepository = stockPriceRepository;
    }

    @Transactional
    public void updatePortfolioValue(Long userId) {
        var userStocks = userStockRepository.findByUserId(userId);
        double totalValue = userStocks.stream()
                .mapToDouble(userStock -> {
                    double stockPrice = stockPriceRepository.findTopByTickerOrderByTimestampDesc(userStock.getTicker())
                            .map(StockPrice::getPrice)
                            .orElse(0.0); 
                    return stockPrice * userStock.getQuantity();
                })
                .sum();

        PortfolioValue portfolioValue = new PortfolioValue();
        portfolioValue.setUserId(userId);
        portfolioValue.setTotalValue(totalValue);
        portfolioValue.setTimestamp(java.time.LocalDateTime.now());
        portfolioValueRepository.save(portfolioValue);
    }

    public List<PortfolioValue> getPortfolioHistory(Long userId) {
        return portfolioValueRepository.findByUserId(userId);
    }
}
