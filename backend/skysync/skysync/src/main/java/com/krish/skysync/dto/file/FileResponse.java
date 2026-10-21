package com.krish.skysync.dto.file;

public record FileResponse(
        Long id,
        String originalFileName,
        String fileUrl,
        String contentType,
        Long fileSize
) {
}