package com.krish.skysync.repository;

import com.krish.skysync.entity.FileShare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FileShareRepository
        extends JpaRepository<FileShare, Long> {

    Optional<FileShare> findByShareToken(String shareToken);

    boolean existsByShareToken(String shareToken);

    List<FileShare> findByFileId(Long fileId);

    void deleteByShareToken(String shareToken);

    @Query("""
            SELECT fs
            FROM FileShare fs, File f
            WHERE fs.fileId = f.id
              AND f.userId = :userId
            ORDER BY fs.createdAt DESC
            """)
    List<FileShare> findAllSharesByUserId(
            @Param("userId") Long userId
    );
}