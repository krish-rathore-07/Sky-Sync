package com.krish.skysync.security;

import com.krish.skysync.entity.User;
import com.krish.skysync.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        System.out.println("Email received from JWT: [" + email + "]");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    System.out.println("USER NOT FOUND IN DATABASE: [" + email + "]");
                    return new UsernameNotFoundException("User not found");
                });

        System.out.println("USER FOUND: " + user.getEmail());

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities(
                        new SimpleGrantedAuthority(
                                "ROLE_" + user.getRole().name()
                        )
                )
                .build();
    }

//    @Override
//    public UserDetails loadUserByUsername(String email)
//            throws UsernameNotFoundException {
//
//        User user = userRepository.findByEmail(email)
//                .orElseThrow(() ->
//                        new UsernameNotFoundException("User not found"));
//
//        return org.springframework.security.core.userdetails.User
//                .withUsername(user.getEmail())
//                .password(user.getPassword())
//                .authorities(
//                        new SimpleGrantedAuthority(
//                                "ROLE_" + user.getRole().name()
//                        )
//                )
//                .build();
//    }
}