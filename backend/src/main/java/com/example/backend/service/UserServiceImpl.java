package com.example.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.model.Stock;
import com.example.backend.model.Transaction;
import com.example.backend.model.User;
import com.example.backend.model.UserStock;
import com.example.backend.model.Watchlist;
import com.example.backend.repository.StockRepository;
import com.example.backend.repository.TransactionRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.UserStockRepository;
import com.example.backend.repository.WatchlistRepository;
import com.example.backend.response.BuyStockRequest;
import com.example.backend.response.SellStockRequest;
import com.example.backend.response.WatchlistRequest;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserStockRepository userStockRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private WatchlistRepository watchlistRepository;

    @Autowired
    private StockRepository stockRepository;

    @Override
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public void addFunds(Long userId, Double amount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));
        user.setFunds(user.getFunds() + amount);
        userRepository.save(user);
    }

    @Override
    public void buyStock(Long userId, BuyStockRequest buyStockRequest) {
        // Fetch user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        String stockName = buyStockRequest.getStockName();
        String ticker = buyStockRequest.getTicker();
        Double price = buyStockRequest.getPrice();
        Integer quantity = buyStockRequest.getQuantity();

        Double totalCost = price * quantity;

        // Check if the user has enough funds
        if (user.getFunds() < totalCost) {
            throw new RuntimeException("Insufficient funds!");
        }

        Stock stock = stockRepository.findByTicker(ticker)
                .orElseThrow(() -> new RuntimeException("Stock not found!"));

        // Check if there is enough volume available
        if (stock.getVolume() < quantity) {
            throw new RuntimeException("Not enough stock volume available!");
        }

        // Deduct the purchased volume from the stock
        stock.setVolume(stock.getVolume() - quantity);
        stockRepository.save(stock);

        // Deduct funds from user account
        user.setFunds(user.getFunds() - totalCost);
        userRepository.save(user); // Save user with updated funds

        // Check if the user already owns this stock
        Optional<UserStock> existingUserStock = userStockRepository.findByUserIdAndTicker(userId, ticker);

        if (existingUserStock.isPresent()) {
            // Stock already exists, update the quantity and purchase price
            UserStock userStock = existingUserStock.get();
            userStock.setQuantity(userStock.getQuantity() + quantity);
            userStock.setPurchasePrice(price);
            userStockRepository.save(userStock);
            System.out.println("Updated " + quantity + " shares of " + stockName + " at $" + price + " each.");
        } else {
            // Stock doesn't exist for this user, create new UserStock
            UserStock userStock = new UserStock();
            userStock.setUser(user);
            userStock.setStockName(stockName);
            userStock.setTicker(ticker);
            userStock.setPurchasePrice(price);
            userStock.setQuantity(quantity);

            userStockRepository.save(userStock);
            System.out.println("Bought " + quantity + " shares of " + stockName + " at $" + price + " each.");
        }

        // Record the transaction
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setAction("BUY");
        transaction.setStockName(stockName);
        transaction.setTicker(ticker);
        transaction.setQuantity(quantity);
        transaction.setPrice(price);
        transaction.setAmount(totalCost);
        transaction.setDate(LocalDateTime.now());

        transactionRepository.save(transaction);
    }

    @Override
    public void sellStock(Long userId, SellStockRequest sellStockRequest) {
        Long stockId = sellStockRequest.getStockId();
        Integer quantity = sellStockRequest.getQuantity();

        UserStock userStock = userStockRepository.findById(stockId)
                .orElseThrow(() -> new RuntimeException("Stock not found!"));

        if (!userStock.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to stock!");
        }

        if (quantity > userStock.getQuantity()) {
            throw new RuntimeException("Not enough stocks to sell!");
        }

        Double fundsToAdd = userStock.getPurchasePrice() * quantity;

        User user = userStock.getUser();
        user.setFunds(user.getFunds() + fundsToAdd);
        userRepository.save(user);

        if (quantity.equals(userStock.getQuantity())) {
            userStockRepository.delete(userStock);
        } else {
            userStock.setQuantity(userStock.getQuantity() - quantity);
            userStockRepository.save(userStock);
        }

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setAction("SELL");
        transaction.setStockName(userStock.getStockName());
        transaction.setTicker(userStock.getTicker());
        transaction.setQuantity(quantity);
        transaction.setPrice(userStock.getPurchasePrice());
        transaction.setAmount(fundsToAdd);
        transaction.setDate(LocalDateTime.now());

        transactionRepository.save(transaction);
    }

    @Override
    public List<UserStock> getUserPortfolio(Long userId) {
        return userStockRepository.findByUserId(userId);
    }

    @Override
    public Double getUserFunds(Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            return userOptional.get().getFunds();
        } else {
            throw new RuntimeException("User not found");
        }
    }

    @Override
    public List<UserStock> getOwnedStocksByUserId(Long userId) {
        return userStockRepository.findByUserId(userId);
    }

    @Override
    public void addStockToWatchlist(Long userId, WatchlistRequest watchlistRequest) {
        Long stockId = watchlistRequest.getStockId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Fetch the stock by its ID
        Stock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new RuntimeException("Stock not found"));

        // Check if the stock is already in the user's watchlist
        Optional<Watchlist> existingWatchlistEntry = watchlistRepository.findByUserIdAndStockId(userId, stockId);

        if (existingWatchlistEntry.isPresent()) {
            throw new RuntimeException("Stock is already in the watchlist");
        }

        // Create a new Watchlist entry
        Watchlist watchlist = new Watchlist();
        watchlist.setStock(stock);
        watchlist.setUser(user);

        // Save the new entry
        watchlistRepository.save(watchlist);
    }

    @Override
    public void removeStockFromWatchlist(Long userId, WatchlistRequest watchlistRequest) {
        Long stockId = watchlistRequest.getStockId();
        Watchlist watchlist = watchlistRepository.findByUserIdAndStockId(userId, stockId)
                .orElseThrow(() -> new RuntimeException("Stock not found in the user's watchlist"));

        watchlistRepository.delete(watchlist);
    }

    @Override
    public List<Long> getStockIdsByUserId(Long userId) {
        return watchlistRepository.findStockIdsByUserId(userId);
    }

}
