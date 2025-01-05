package com.example.backend.repository;

import com.example.backend.model.Stock;
import com.example.backend.model.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;


public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {
    @Query("SELECT w.stock.id FROM Watchlist w WHERE w.user.id = :userId")
    List<Long> findStockIdsByUserId(Long userId);   
    Optional<Watchlist> findByUserIdAndStockId(Long userId, Long stockId);
    List<Watchlist> findByUserId(Long userId);
}
