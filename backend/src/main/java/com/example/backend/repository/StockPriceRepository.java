package com.example.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.backend.model.StockPrice;


@Repository
public interface StockPriceRepository extends JpaRepository<StockPrice, Long> {
    List<StockPrice> findByStockIdOrderByTimestampDesc(Long stockId);
    Optional<StockPrice> findTopByStockIdOrderByTimestampDesc(Long stockId);
    Optional<StockPrice> findTopByTickerOrderByTimestampDesc(@Param("ticker") String ticker);

}    