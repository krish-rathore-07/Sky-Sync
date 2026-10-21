package com.krish.skysync.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank(message = "Name cannot be empty")
        @Size(max = 80, message = "Name must not exceed 80 characters")
        String name
) {}