package com.insurai.backend.controller;
import com.insurai.backend.entity.User;
import com.insurai.backend.repository.UserRepository;
import com.insurai.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    // 1. REGISTER
    // ... (existing code for registerUser) ...
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Email already exists!");
        }

        User savedUser = userRepository.save(user);

        // Send Welcome Email
        new Thread(() -> {
            String subject = "Welcome to InsurAI - Registration Successful";
            String body = "Dear " + savedUser.getFullName() + ",\n\n" +
                    "Welcome to the InsurAI Corporate Portal.\n" +
                    "Your Account (" + savedUser.getRole() + ") has been created successfully.\n\n" +
                    "Login Here: http://localhost:5173/login\n\n" +
                    "Best Regards,\nInsurAI Security Team";
            emailService.sendEmail(savedUser.getEmail(), subject, body);
        }).start();

        return ResponseEntity.ok(savedUser);
    }

    // 2. LOGIN
    // ... (existing code for loginUser) ...
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // NOTE: Replace simple password check with BCrypt matching in production!
            if (user.getPassword().equals(password)) {
                return ResponseEntity.ok(user); // Login Success
            }
        }
        return ResponseEntity.status(401).body("Invalid Email or Password");
    }

    // 3. FORGOT PASSWORD
    // ... (existing code for forgotPassword) ...
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Generate a fake temporary password
            String tempPassword = "Temp" + new Random().nextInt(9999);
            user.setPassword(tempPassword); // Update DB
            userRepository.save(user);

            // Send Email
            new Thread(() -> {
                String subject = "InsurAI - Password Reset Request";
                String body = "Dear " + user.getFullName() + ",\n\n" +
                        "Your new temporary password is: " + tempPassword + "\n\n" +
                        "Please login and change it immediately.\n\n" +
                        "Regards,\nInsurAI Security";
                emailService.sendEmail(user.getEmail(), subject, body);
            }).start();

            return ResponseEntity.ok("Password reset link sent to email.");
        }
        return ResponseEntity.badRequest().body("Email not found.");
    }

    // 4. GET user by ID (FETCH PROFILE)
    // ... (existing code for getUserById) ...
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 5. UPDATE user details (SAVE PROFILE)
    // ... (existing code for updateUser) ...
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        return userRepository.findById(id)
                .map(user -> {
                    // Update only mutable fields (KYC details)
                    user.setFullName(userDetails.getFullName());
                    user.setPhoneNumber(userDetails.getPhoneNumber());
                    // NOTE: Password and Role are not updated via this endpoint.

                    User updatedUser = userRepository.save(user);
                    return ResponseEntity.ok(updatedUser);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 🔥 NEW: 7. GET ALL AGENTS (Endpoint for the Customer Appointment Page)
    @GetMapping("/agents")
    public List<User> getAllAgents() {
        // Calls the new method added to the UserRepository interface
        return userRepository.findByRole("AGENT");
    }

    // 6. GET ALL (For Admin Dashboard)
    @GetMapping("/all")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}