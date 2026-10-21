package com.krish.skysync.controller;

import com.krish.skysync.dto.share.ShareRequest;
import com.krish.skysync.dto.share.ShareResponse;
import com.krish.skysync.dto.share.SharedFileItemResponse;
import com.krish.skysync.dto.share.SharedFileResponse;
import com.krish.skysync.entity.User;
import com.krish.skysync.repository.UserRepository;
import com.krish.skysync.service.ShareService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shares")
@RequiredArgsConstructor
public class ShareController {

    private final ShareService shareService;
    private final UserRepository userRepository;

    @PostMapping("/{fileId}")
    public ResponseEntity<ShareResponse> createShare(
            @PathVariable Long fileId,
            @Valid @RequestBody(required = false) ShareRequest request,
            Authentication authentication
    ) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Long expirationHours =
                request != null
                        ? request.expirationHours()
                        : null;

        return ResponseEntity.ok(
                shareService.createShare(
                        fileId,
                        user.getId(),
                        expirationHours
                )
        );
    }

    @GetMapping("/{token}")
    public ResponseEntity<SharedFileResponse> getSharedFile(
            @PathVariable String token
    ) {

        return ResponseEntity.ok(
                shareService.getSharedFile(token)
        );
    }

    @DeleteMapping("/{token}")
    public ResponseEntity<String> revokeShare(
            @PathVariable String token,
            Authentication authentication
    ) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        shareService.revokeShare(
                token,
                user.getId()
        );

        return ResponseEntity.ok(
                "Share link revoked successfully"
        );
    }

    @GetMapping("/my-shares")
    public ResponseEntity<java.util.List<SharedFileItemResponse>> getMyShares(
            Authentication authentication
    ) {
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(
                shareService.getMyShares(user.getId())
        );
    }
}