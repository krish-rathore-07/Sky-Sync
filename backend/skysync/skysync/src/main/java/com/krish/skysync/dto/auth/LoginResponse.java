package com.krish.skysync.dto.auth;

public record LoginResponse(
        String token,
        String name,
        String email
) {
}