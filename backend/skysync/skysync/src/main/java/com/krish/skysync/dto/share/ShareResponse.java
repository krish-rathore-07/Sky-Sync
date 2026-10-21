package com.krish.skysync.dto.share;

import java.time.LocalDateTime;

public record ShareResponse(
        String shareToken,
        String shareUrl,
        LocalDateTime expiresAt
) {
}