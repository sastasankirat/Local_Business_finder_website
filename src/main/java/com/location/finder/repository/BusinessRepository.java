package com.location.finder.repository;

import com.location.finder.entity.Business;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BusinessRepository extends JpaRepository<Business, Long> {
    // You can add custom query methods here if needed
    // For example, to find by category:
    List<Business> findByCategory(String category);
}
