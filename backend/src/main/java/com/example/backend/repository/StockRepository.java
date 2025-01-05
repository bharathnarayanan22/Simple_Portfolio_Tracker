package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.Stock;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {
    
}
