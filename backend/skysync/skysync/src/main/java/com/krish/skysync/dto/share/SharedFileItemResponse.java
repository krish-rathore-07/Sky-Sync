package com.krish.skysync.dto.share;

import java.time.LocalDateTime;

public record SharedFileItemResponse(
        Long id,
        Long fileId,
        String fileName,
        String fileUrl,
        String contentType,
        Long fileSize,
        String shareToken,
        String shareUrl,
        LocalDateTime createdAt,
        LocalDateTime expiresAt,
        boolean expired
) {
}