package com.krish.skysync.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.krish.skysync.dto.file.FileResponse;
import com.krish.skysync.entity.File;
import com.krish.skysync.repository.FileRepository;
import com.krish.skysync.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FileServiceImpl implements FileService {

    private final Cloudinary cloudinary;
    private final FileRepository fileRepository;

    @Override
    public FileResponse uploadFile(MultipartFile file, Long userId) {

        try {

            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "resource_type", "auto"
                    )
            );

            String fileUrl = result.get("secure_url").toString();
            String publicId = result.get("public_id").toString();

            File savedFile = File.builder()
                    .originalFileName(file.getOriginalFilename())
                    .fileUrl(fileUrl)
                    .publicId(publicId)
                    .contentType(file.getContentType())
                    .fileSize(file.getSize())
                    .userId(userId)
                    .build();

            savedFile = fileRepository.save(savedFile);

            return new FileResponse(
                    savedFile.getId(),
                    savedFile.getOriginalFileName(),
                    savedFile.getFileUrl(),
                    savedFile.getContentType(),
                    savedFile.getFileSize()
            );

        } catch (IOException e) {
            throw new RuntimeException("File upload failed", e);
        }
    }

    @Override
    public List<FileResponse> getMyFiles(Long userId) {

        return fileRepository.findByUserId(userId)
                .stream()
                .map(file -> new FileResponse(
                        file.getId(),
                        file.getOriginalFileName(),
                        file.getFileUrl(),
                        file.getContentType(),
                        file.getFileSize()
                ))
                .toList();
    }

    @Override
    public void deleteFile(Long fileId, Long userId) {

        File file = fileRepository.findByIdAndUserId(fileId, userId)
                .orElseThrow(() ->
                        new RuntimeException("File not found or access denied")
                );

        try {

            cloudinary.uploader().destroy(
                    file.getPublicId(),
                    ObjectUtils.emptyMap()
            );

            fileRepository.delete(file);

        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file", e);
        }
    }

    @Override
    public FileResponse getFile(Long fileId, Long userId) {

        File file = fileRepository.findByIdAndUserId(fileId, userId)
                .orElseThrow(() ->
                        new RuntimeException("File not found or access denied")
                );

        return new FileResponse(
                file.getId(),
                file.getOriginalFileName(),
                file.getFileUrl(),
                file.getContentType(),
                file.getFileSize()
        );
    }

    @Override
    public void deleteAllFilesByUserId(Long userId) {

        List<File> files = fileRepository.findByUserId(userId);

        for (File file : files) {
            try {
                Map<?, ?> result = cloudinary.uploader().destroy(
                        file.getPublicId(),
                        ObjectUtils.asMap(
                                "resource_type", getResourceType(file.getContentType())
                        )
                );

                Object deletionResult = result.get("result");

                if (!"ok".equals(deletionResult)
                        && !"not found".equals(deletionResult)) {
                    throw new RuntimeException(
                            "Cloudinary could not delete file: "
                                    + file.getOriginalFileName()
                    );
                }

            } catch (IOException e) {
                throw new RuntimeException(
                        "Failed to delete file: "
                                + file.getOriginalFileName(),
                        e
                );
            }
        }

        fileRepository.deleteAll(files);
    }

    private String getResourceType(String contentType) {

        if (contentType == null) {
            return "raw";
        }

        if (contentType.startsWith("image/")) {
            return "image";
        }

        if (contentType.startsWith("video/")) {
            return "video";
        }

        return "raw";
    }
}