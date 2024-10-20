package com.location.finder.repository;

import com.location.finder.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Custom query method to find a user by username
    Optional<User> findByUsername(String username);
    
    // You can add more custom queries if needed
}
