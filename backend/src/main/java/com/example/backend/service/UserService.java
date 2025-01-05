package com.example.backend.service;

import java.util.List;
import java.util.Optional;

import com.example.backend.model.Stock;
import com.example.backend.model.User;
import com.example.backend.model.UserStock;
import com.example.backend.model.Watchlist;
import com.example.backend.response.BuyStockRequest;
import com.example.backend.response.SellStockRequest;
import com.example.backend.response.WatchlistRequest;

public interface UserService {
    User saveUser(User user);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
    // New methods for stock management
    void addFunds(Long userId, Double amount);

    void buyStock(Long userId, BuyStockRequest buyStockRequest);

    void sellStock(Long userId, SellStockRequest sellStockRequest);

    List<UserStock> getUserPortfolio(Long userId);

    // New method to fetch user's funds
    Double getUserFunds(Long userId);

    List<UserStock> getOwnedStocksByUserId(Long userId);

    void addStockToWatchlist(Long userId, WatchlistRequest watchlistRequest);

    void removeStockFromWatchlist(Long userId, WatchlistRequest watchlistRequest);
    List<Long> getStockIdsByUserId(Long userId);
}
