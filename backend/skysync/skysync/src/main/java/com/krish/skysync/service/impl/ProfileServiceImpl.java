package com.krish.skysync.service.impl;

import com.krish.skysync.dto.user.ProfileResponse;
import com.krish.skysync.dto.user.UpdateProfileRequest;
import com.krish.skysync.entity.User;
import com.krish.skysync.repository.UserRepository;
import com.krish.skysync.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public ProfileResponse getCurrentProfile(String email) {
        User user = findUser(email);
        return toResponse(user);
    }

    @Override
    @Transactional
    public ProfileResponse updateProfile(
            String email,
            UpdateProfileRequest request
    ) {
        User user = findUser(email);

        user.setName(request.name().trim());

        User savedUser = userRepository.save(user);

        return toResponse(savedUser);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found")
                );
    }

    private ProfileResponse toResponse(User user) {
        return new ProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail()
        );
    }
}