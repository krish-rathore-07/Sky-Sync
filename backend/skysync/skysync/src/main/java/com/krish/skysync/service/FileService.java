package com.krish.skysync.service;

import com.krish.skysync.dto.file.FileResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface FileService {

    FileResponse uploadFile(MultipartFile file, Long userId);

    List<FileResponse> getMyFiles(Long userId);

    void deleteFile(Long fileId, Long userId);

    void deleteAllFilesByUserId(Long userId);

    FileResponse getFile(Long fileId, Long userId);
}