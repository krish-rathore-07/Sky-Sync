package com.krish.skysync.controller;

import com.krish.skysync.dto.file.FileResponse;
import com.krish.skysync.entity.User;
import com.krish.skysync.repository.UserRepository;
import com.krish.skysync.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;
    private final UserRepository userRepository;

    @PostMapping("/upload")
    public ResponseEntity<FileResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Long userId = user.getId();

        return ResponseEntity.ok(
                fileService.uploadFile(file, userId)
        );
    }

    @GetMapping("/my-files")
    public ResponseEntity<List<FileResponse>> getMyFiles(
            Authentication authentication
    ) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        return ResponseEntity.ok(
                fileService.getMyFiles(user.getId())
        );
    }

    @DeleteMapping("/{fileId}")
    public ResponseEntity<String> deleteFile(
            @PathVariable Long fileId,
            Authentication authentication
    ) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        fileService.deleteFile(fileId, user.getId());

        return ResponseEntity.ok("File deleted successfully");
    }

    @GetMapping("/{fileId}")
    public ResponseEntity<FileResponse> getFile(
            @PathVariable Long fileId,
            Authentication authentication
    ) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        return ResponseEntity.ok(
                fileService.getFile(fileId, user.getId())
        );
    }
}