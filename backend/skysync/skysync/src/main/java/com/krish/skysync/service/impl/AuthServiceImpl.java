package com.krish.skysync.service.impl;

import com.krish.skysync.dto.auth.ChangePasswordRequest;
import com.krish.skysync.dto.auth.LoginRequest;
import com.krish.skysync.dto.auth.LoginResponse;
import com.krish.skysync.dto.auth.RegisterRequest;
import com.krish.skysync.entity.User;
import com.krish.skysync.repository.UserRepository;
import com.krish.skysync.security.JwtService;
import com.krish.skysync.service.AuthService;
import com.krish.skysync.service.FileService;
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

    private final FileService fileService;
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
                            .setAudience(Collections.singletonList(googleClientId.trim()))
                            .build();

            // ==========================================
            // GOOGLE TOKEN VERIFICATION
            // ==========================================

            GoogleIdToken idToken = verifier.verify(request.credential());

            System.out.println("========== GOOGLE LOGIN DEBUG ==========");

            System.out.println(
                    "Client ID configured: " +
                            (googleClientId != null && !googleClientId.isBlank())
            );

            System.out.println(
                    "Credential received: " +
                            (request.credential() != null && !request.credential().isBlank())
            );

            System.out.println(
                    "Credential length: " +
                            (request.credential() == null ? 0 : request.credential().length())
            );

            System.out.println("Token verified: " + (idToken != null));

            System.out.println("========================================");

            if (idToken == null) {
                throw new IllegalArgumentException(
                        "Google token verification failed. Please check your Google OAuth configuration."
                );
            }

            payload = idToken.getPayload();
            System.out.println("Google email verified: " + payload.getEmailVerified());
            System.out.println("Google subject present: " + (payload.getSubject() != null));
            System.out.println("Google email present: " + (payload.getEmail() != null));

        } catch (GeneralSecurityException | IOException e) {

            throw new IllegalArgumentException(
                    "Unable to verify Google identity. Please try again.",
                    e
            );
        }

        // ==========================================
        // VERIFY EMAIL
        // ==========================================

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

        // ==========================================
        // EXISTING GOOGLE USER
        // ==========================================

        User user = userRepository.findByGoogleSubject(googleSubject)
                .orElse(null);

        if (user != null) {

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

        // ==========================================
        // EXISTING EMAIL/PASSWORD ACCOUNT
        // ==========================================

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists. " +
                            "Please log in using your email and password."
            );
        }

        // ==========================================
        // CREATE NEW GOOGLE USER
        // ==========================================

        User newUser = User.builder()
                .name(name == null || name.isBlank() ? email : name)
                .email(email)
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .googleSubject(googleSubject)
                .build();

        User savedUser = userRepository.save(newUser);

        // ==========================================
        // GENERATE SKYSYNC JWT
        // ==========================================

        String token = jwtService.generateToken(savedUser.getEmail());

        return new LoginResponse(
                token,
                savedUser.getName(),
                savedUser.getEmail()
        );
    }

    @Override
    @Transactional
    public void deleteAccount(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Delete files stored in Cloudinary and their database records.
        fileService.deleteAllFilesByUserId(user.getId());

        // Delete the user's account.
        userRepository.delete(user);
    }
}