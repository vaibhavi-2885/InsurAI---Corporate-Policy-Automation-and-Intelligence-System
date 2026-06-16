package com.insurai.backend.repository;

import com.insurai.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List; // 👈 CRITICAL: Added missing import for List

public interface UserRepository extends JpaRepository<User, Long> {

    // This method allows us to find a user by their email (for login later)
    Optional<User> findByEmail(String email);

    // 🔥 NEW METHOD: Spring Data JPA automatically finds all users with the given role.
    List<User> findByRole(String role);
}