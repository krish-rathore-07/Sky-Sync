package com.krish.skysync.controller;

import com.krish.skysync.dto.auth.*;
import com.krish.skysync.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @Valid @RequestBody RegisterRequest request
    ) {

        String message = authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(message);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {

        return ResponseEntity.ok(
                authService.login(request)
        );
    }

    @PutMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request
    ) {

        authService.changePassword(
                authentication.getName(),
                request
        );

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/google")
    public ResponseEntity<LoginResponse> googleLogin(
            @Valid @RequestBody GoogleLoginRequest request
    ) {
        return ResponseEntity.ok(authService.googleLogin(request));
    }

    @DeleteMapping("/delete-account")
    public ResponseEntity<Void> deleteAccount(
            Authentication authentication
    ) {
        authService.deleteAccount(authentication.getName());

        return ResponseEntity.noContent().build();
    }
}