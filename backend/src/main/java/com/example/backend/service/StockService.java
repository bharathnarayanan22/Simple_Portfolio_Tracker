package com.example.backend.service;

import java.util.List;

import com.example.backend.model.Stock;

public interface StockService {
    Stock addStock(Stock stock);
    List<Stock> getAllStocks();
    Stock updateStock(Long id, Stock stockDetails);
    void deleteStock(Long id);
    Stock getStockById(Long id);

}
