package com.example.backend.repository;

import com.example.backend.model.PortfolioValue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PortfolioValueRepository extends JpaRepository<PortfolioValue, Long> {
    List<PortfolioValue> findByUserId(Long userId);
}
