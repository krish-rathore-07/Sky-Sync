package com.krish.skysync.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        System.out.println("\n========== JWT DEBUG ==========");
        System.out.println("Request: " + request.getMethod() + " " + request.getRequestURI());
        System.out.println("Authorization header present: " + (authHeader != null));

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("JWT missing or invalid Bearer format");
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            String email = jwtService.extractEmail(token);

            System.out.println("JWT email: " + email);

            if (SecurityContextHolder.getContext().getAuthentication() == null) {

                UserDetails userDetails =
                        userDetailsService.loadUserByUsername(email);

                if (jwtService.isTokenValid(token, userDetails)) {

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder.getContext()
                            .setAuthentication(authentication);

                    System.out.println("JWT authentication successful");

                } else {
                    System.out.println("JWT token validation returned false");
                }
            }

        } catch (Exception e) {
            System.out.println("JWT ERROR: " + e.getClass().getSimpleName()
                    + " - " + e.getMessage());
        }

        System.out.println("Authenticated: " +
                (SecurityContextHolder.getContext().getAuthentication() != null));

        System.out.println("================================\n");

        filterChain.doFilter(request, response);
    }


//    @Override
//    protected void doFilterInternal(
//            HttpServletRequest request,
//            HttpServletResponse response,
//            FilterChain filterChain
//    ) throws ServletException, IOException {
//
//
//        String authHeader = request.getHeader("Authorization");
//
//        System.out.println("Request URI: " + request.getRequestURI());
//        System.out.println("Request Method: " + request.getMethod());
//        System.out.println("Authorization Header Present: " + (authHeader != null));
//
//
//        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
//            filterChain.doFilter(request, response);
//            return;
//        }
//
//        String token = authHeader.substring(7);
//
//        String email;
//
//        try {
//            email = jwtService.extractEmail(token);
//        } catch (Exception e) {
//
//            System.out.println("JWT validation/extraction failed: " + e.getMessage());
//            filterChain.doFilter(request, response);
//            return;
//        }
//
//        if (email != null &&
//                SecurityContextHolder.getContext().getAuthentication() == null) {
//
//            UserDetails userDetails =
//                    userDetailsService.loadUserByUsername(email);
//
//            if (jwtService.isTokenValid(token, userDetails)) {
//
//                UsernamePasswordAuthenticationToken authentication =
//                        new UsernamePasswordAuthenticationToken(
//                                userDetails,
//                                null,
//                                userDetails.getAuthorities()
//                        );
//
//                authentication.setDetails(
//                        new WebAuthenticationDetailsSource()
//                                .buildDetails(request)
//                );
//
//                SecurityContextHolder.getContext()
//                        .setAuthentication(authentication);
//            }
//        }
//
//        filterChain.doFilter(request, response);
//    }
}