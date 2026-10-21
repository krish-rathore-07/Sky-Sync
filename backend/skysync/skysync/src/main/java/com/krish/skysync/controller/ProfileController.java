package com.krish.skysync.controller;

import com.krish.skysync.dto.user.ProfileResponse;
import com.krish.skysync.dto.user.UpdateProfileRequest;
import com.krish.skysync.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> getCurrentProfile(
            Authentication authentication
    ) {
        ProfileResponse profile =
                profileService.getCurrentProfile(
                        authentication.getName()
                );

        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    public ResponseEntity<ProfileResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        ProfileResponse profile =
                profileService.updateProfile(
                        authentication.getName(),
                        request
                );

        return ResponseEntity.ok(profile);
    }
}