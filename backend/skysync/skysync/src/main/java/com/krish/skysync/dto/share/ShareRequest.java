package com.krish.skysync.dto.share;

import jakarta.validation.constraints.Min;

public record ShareRequest(
        @Min(value = 1, message = "Expiration must be at least 1 hour")
        Long expirationHours
) {
}