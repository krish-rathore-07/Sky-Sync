package com.krish.skysync.service.impl;

import com.krish.skysync.dto.auth.ChangePasswordRequest;
import com.krish.skysync.dto.auth.LoginRequest;
import com.krish.skysync.dto.auth.LoginResponse;
import com.krish.skysync.dto.auth.RegisterRequest;
import com.krish.skysync.entity.User;
import com.krish.skysync.repository.UserRepository;
import com.krish.skysync.security.JwtService;
import com.krish.skysync.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.krish.skysync.dto.auth.GoogleLoginRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${google.client-id}")
    private String googleClientId;

    @Override
    public String register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .build();

        userRepository.save(user);

        return "User registered successfully";
    }

    @Override
    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(
                request.password(),
                user.getPassword()
        )) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail());

        return new LoginResponse(
                token,
                user.getName(),
                user.getEmail()
        );
    }

    @Override
    @Transactional
    public void changePassword(
            String email,
            ChangePasswordRequest request
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (!passwordEncoder.matches(
                request.currentPassword(),
                user.getPassword()
        )) {
            throw new IllegalArgumentException(
                    "Current password is incorrect"
            );
        }

        if (passwordEncoder.matches(
                request.newPassword(),
                user.getPassword()
        )) {
            throw new IllegalArgumentException(
                    "New password must differ from the current password"
            );
        }

        user.setPassword(
                passwordEncoder.encode(request.newPassword())
        );

        userRepository.save(user);
    }

    @Override
    @Transactional
    public LoginResponse googleLogin(GoogleLoginRequest request) {

        GoogleIdToken.Payload payload;

        try {
            GoogleIdTokenVerifier verifier =
                    new GoogleIdTokenVerifier.Builder(
                            new NetHttpTransport(),
                            GsonFactory.getDefaultInstance()
                    )
                            .setAudience(Collections.singletonList(googleClientId))
                            .build();

            GoogleIdToken idToken = verifier.verify(request.credential());

            if (idToken == null) {
                throw new IllegalArgumentException(
                        "Invalid Google credential. Please try again."
                );
            }

            payload = idToken.getPayload();

        } catch (GeneralSecurityException | IOException e) {
            throw new IllegalArgumentException(
                    "Unable to verify Google identity. Please try again."
            );
        }

        // Require a verified Google email.
        Boolean emailVerified = payload.getEmailVerified();

        if (!Boolean.TRUE.equals(emailVerified)) {
            throw new IllegalArgumentException(
                    "Your Google email address must be verified."
            );
        }

        String googleSubject = payload.getSubject();
        String email = payload.getEmail();
        String name = (String) payload.get("name");

        if (googleSubject == null || email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Google did not provide the required account information."
            );
        }

        // 1. Existing Google account: log in.
        User user = userRepository.findByGoogleSubject(googleSubject)
                .orElse(null);

        if (user != null) {

            // Prevent inconsistent account identity data.
            if (!user.getEmail().equalsIgnoreCase(email)) {
                throw new IllegalArgumentException(
                        "Google account information does not match."
                );
            }

            String token = jwtService.generateToken(user.getEmail());

            return new LoginResponse(
                    token,
                    user.getName(),
                    user.getEmail()
            );
        }

        // 2. Email exists but is not linked to Google: reject.
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists. "
                            + "Please log in using your email and password."
            );
        }

        // 3. New Google account: create a SkySync user.
        User newUser = User.builder()
                .name(name == null || name.isBlank() ? email : name)
                .email(email)
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .googleSubject(googleSubject)
                .build();

        User savedUser = userRepository.save(newUser);

        // 4. Return the same JWT response format as normal login.
        String token = jwtService.generateToken(savedUser.getEmail());

        return new LoginResponse(
                token,
                savedUser.getName(),
                savedUser.getEmail()
        );
    }
}