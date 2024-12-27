package com.example.backend.service;

import com.example.backend.model.User;

import java.util.Optional;

public interface UserService {
    User saveUser(User user);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
