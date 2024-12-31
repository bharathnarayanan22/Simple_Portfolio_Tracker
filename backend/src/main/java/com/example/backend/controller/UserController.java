package com.example.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.model.Transaction;
import com.example.backend.model.UserStock;
import com.example.backend.repository.TransactionRepository;
import com.example.backend.repository.UserStockRepository;
import com.example.backend.response.BuyStockRequest;
import com.example.backend.response.SellStockRequest;
import com.example.backend.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/{userId}/addFunds")
    public ResponseEntity<String> addFunds(@PathVariable Long userId, @RequestParam Double amount) {
        userService.addFunds(userId, amount);
        return ResponseEntity.ok("Funds added successfully!");
    }

    @PostMapping("/{userId}/buyStock")
    public ResponseEntity<String> buyStock(@PathVariable Long userId, @RequestBody BuyStockRequest buyStockRequest) {
        userService.buyStock(userId, buyStockRequest);
        return ResponseEntity.ok("Stock purchased successfully!");
    }

    @PostMapping("/{userId}/sellStock")
    public ResponseEntity<String> sellStock(
            @PathVariable Long userId,
            @RequestBody SellStockRequest sellStockRequest // Accept the sell stock request body
    ) {
        userService.sellStock(userId, sellStockRequest);
        return ResponseEntity.ok("Stock sold successfully!");
    }

    @GetMapping("/{userId}/portfolio")
    public ResponseEntity<List<UserStock>> getUserPortfolio(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserPortfolio(userId));
    }

    @GetMapping("/{userId}/funds")
    public ResponseEntity<Double> getUserFunds(@PathVariable Long userId) {
        Double funds = userService.getUserFunds(userId);
        return ResponseEntity.ok(funds);
    }

    @Autowired
    private UserStockRepository userStockRepository;

    @GetMapping("/{userId}/stocks")
    public List<UserStock> getUserStocks(@PathVariable Long userId) {
        return userStockRepository.findByUserId(userId);
    }

    @Autowired
    private TransactionRepository transactionRepository;

    @GetMapping("/{userId}/transactions")
    public ResponseEntity<List<Transaction>> getTransactions(@PathVariable Long userId) {
        return ResponseEntity.ok(transactionRepository.findByUserId(userId));
    }

}
