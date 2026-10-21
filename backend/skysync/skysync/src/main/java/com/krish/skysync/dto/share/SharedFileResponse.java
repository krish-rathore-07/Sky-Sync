package com.krish.skysync.dto.share;

public record SharedFileResponse(
        String originalFileName,
        String fileUrl,
        String contentType,
        Long fileSize
) {
}