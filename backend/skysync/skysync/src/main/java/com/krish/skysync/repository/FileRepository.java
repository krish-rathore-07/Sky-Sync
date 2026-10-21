package com.krish.skysync.repository;

import com.krish.skysync.entity.File;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FileRepository extends JpaRepository<File, Long> {

    List<File> findByUserId(Long userId);

    Optional<File> findByIdAndUserId(Long id, Long userId);
}