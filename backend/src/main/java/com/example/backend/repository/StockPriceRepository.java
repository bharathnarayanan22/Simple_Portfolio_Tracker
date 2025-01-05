package com.example.backend.repository;

import com.example.backend.model.StockPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface StockPriceRepository extends JpaRepository<StockPrice, Long> {
    List<StockPrice> findByStockIdOrderByTimestampDesc(Long stockId);
    Optional<StockPrice> findTopByStockIdOrderByTimestampDesc(Long stockId);
}
