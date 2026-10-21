package com.krish.skysync.service.impl;

import com.krish.skysync.dto.share.ShareResponse;
import com.krish.skysync.dto.share.SharedFileItemResponse;
import com.krish.skysync.dto.share.SharedFileResponse;
import com.krish.skysync.entity.File;
import com.krish.skysync.entity.FileShare;
import com.krish.skysync.repository.FileRepository;
import com.krish.skysync.repository.FileShareRepository;
import com.krish.skysync.service.ShareService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShareServiceImpl implements ShareService {

    private final FileRepository fileRepository;
    private final FileShareRepository fileShareRepository;

    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    public ShareResponse createShare(
            Long fileId,
            Long userId,
            Long expirationHours
    ) {

        File file = fileRepository.findByIdAndUserId(fileId, userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "File not found or access denied"
                        )
                );

        String token;

        do {
            byte[] randomBytes = new byte[32];
            secureRandom.nextBytes(randomBytes);

            token = Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(randomBytes);

        } while (fileShareRepository.existsByShareToken(token));

        LocalDateTime expiresAt = null;

        if (expirationHours != null) {
            expiresAt = LocalDateTime.now()
                    .plusHours(expirationHours);
        }

        FileShare fileShare = FileShare.builder()
                .fileId(file.getId())
                .shareToken(token)
                .expiresAt(expiresAt)
                .build();

        fileShareRepository.save(fileShare);

        String shareUrl =
                "http://localhost:5173/share/" + token;

        return new ShareResponse(
                token,
                shareUrl,
                expiresAt
        );
    }

    @Override
    public SharedFileResponse getSharedFile(String token) {

        FileShare fileShare = fileShareRepository
                .findByShareToken(token)
                .orElseThrow(() ->
                        new RuntimeException("Invalid or expired share link")
                );

        if (fileShare.getExpiresAt() != null &&
                fileShare.getExpiresAt().isBefore(
                        java.time.LocalDateTime.now()
                )) {

            throw new RuntimeException("Share link has expired");
        }

        File file = fileRepository.findById(fileShare.getFileId())
                .orElseThrow(() ->
                        new RuntimeException("File no longer exists")
                );

        return new SharedFileResponse(
                file.getOriginalFileName(),
                file.getFileUrl(),
                file.getContentType(),
                file.getFileSize()
        );
    }

    @Override
    public void revokeShare(String token, Long userId) {

        FileShare fileShare = fileShareRepository
                .findByShareToken(token)
                .orElseThrow(() ->
                        new RuntimeException("Share link not found")
                );

        fileRepository.findByIdAndUserId(
                        fileShare.getFileId(),
                        userId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "You are not allowed to revoke this share"
                        )
                );

        fileShareRepository.delete(fileShare);
    }

    @Override
    public List<SharedFileItemResponse> getMyShares(Long userId) {

        LocalDateTime now = LocalDateTime.now();

        return fileShareRepository.findAllSharesByUserId(userId)
                .stream()
                .map(fileShare -> {

                    File file = fileRepository
                            .findById(fileShare.getFileId())
                            .orElse(null);

                    if (file == null) {
                        return null;
                    }

                    boolean expired =
                            fileShare.getExpiresAt() != null
                                    && fileShare.getExpiresAt().isBefore(now);

                    return new SharedFileItemResponse(
                            fileShare.getId(),
                            file.getId(),
                            file.getOriginalFileName(),
                            file.getFileUrl(),
                            file.getContentType(),
                            file.getFileSize(),
                            fileShare.getShareToken(),
                            "http://localhost:5173/share/" + fileShare.getShareToken(),
                            fileShare.getCreatedAt(),
                            fileShare.getExpiresAt(),
                            expired
                    );
                })
                .filter(java.util.Objects::nonNull)
                .toList();
    }
}