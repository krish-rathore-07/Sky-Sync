package com.krish.skysync.service;

import com.krish.skysync.dto.user.ProfileResponse;
import com.krish.skysync.dto.user.UpdateProfileRequest;

public interface ProfileService {

    ProfileResponse getCurrentProfile(String email);

    ProfileResponse updateProfile(
            String email,
            UpdateProfileRequest request
    );
}