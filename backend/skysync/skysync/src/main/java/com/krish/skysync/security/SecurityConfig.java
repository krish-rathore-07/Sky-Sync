package com.krish.skysync.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    // =========================================================
    // PASSWORD ENCODER
    // =========================================================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // =========================================================
    // SECURITY FILTER CHAIN
    // =========================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

                // -------------------------------------------------
                // Disable CSRF
                // -------------------------------------------------

                .csrf(AbstractHttpConfigurer::disable)

                // -------------------------------------------------
                // Enable CORS
                // Uses CorsConfigurationSource from CorsConfig
                // -------------------------------------------------

                .cors(cors -> {})

                // -------------------------------------------------
                // Authorization
                // -------------------------------------------------

                .authorizeHttpRequests(auth -> auth

                        // -----------------------------------------
                        // CORS preflight requests
                        // -----------------------------------------

                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

                        // -----------------------------------------
                        // Authentication
                        // Register + Login
                        // -----------------------------------------

                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/google"
                        ).permitAll()

                        .requestMatchers(
                                "/api/auth/change-password",
                                "/api/auth/delete-account"
                        ).authenticated()

                        // -----------------------------------------
                        // Public share access
                        // No JWT required
                        // -----------------------------------------

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/shares/my-shares"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/shares/*"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/shares/**"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/shares/**"
                        ).authenticated()

                        // -----------------------------------------
                        // Create share link
                        // JWT required
                        // -----------------------------------------

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/shares/**"
                        ).authenticated()

                        // -----------------------------------------
                        // Delete / revoke share
                        // JWT required
                        // -----------------------------------------

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/shares/**"
                        ).authenticated()

                        // -----------------------------------------
                        // File APIs
                        // JWT required
                        // -----------------------------------------

                        .requestMatchers(
                                "/api/files/**"
                        ).authenticated()

                        // -----------------------------------------
                        // Everything else
                        // JWT required
                        // -----------------------------------------

                        .anyRequest().authenticated()
                )

                // -------------------------------------------------
                // JWT Authentication Filter
                // -------------------------------------------------

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}