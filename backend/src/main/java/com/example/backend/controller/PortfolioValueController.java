package com.example.backend.controller;

import com.example.backend.model.PortfolioValue;
import com.example.backend.service.PortfolioValueService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioValueController {

    private final PortfolioValueService portfolioValueService;

    public PortfolioValueController(PortfolioValueService portfolioValueService) {
        this.portfolioValueService = portfolioValueService;
    }

    @PostMapping("/update/{userId}")
    public String updatePortfolioValue(@PathVariable Long userId) {
        portfolioValueService.updatePortfolioValue(userId);
        return "Portfolio value updated successfully!";
    }

    @GetMapping("/history/{userId}")
    public List<PortfolioValue> getPortfolioHistory(@PathVariable Long userId) {
        return portfolioValueService.getPortfolioHistory(userId);
    }
}
