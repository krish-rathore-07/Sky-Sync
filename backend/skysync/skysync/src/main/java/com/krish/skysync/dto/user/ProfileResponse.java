package com.krish.skysync.dto.user;

public record ProfileResponse(
        Long id,
        String name,
        String email
) {}