package com.example.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.UserStock;

@Repository
public interface UserStockRepository extends JpaRepository<UserStock, Long> {
    List<UserStock> findByUserId(Long userId);
    Optional<UserStock> findByTicker(String ticker);
    Optional<UserStock> findByUserIdAndTicker(Long userId, String ticker);

    

}
