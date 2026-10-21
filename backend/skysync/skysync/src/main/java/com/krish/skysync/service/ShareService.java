package com.krish.skysync.service;

import com.krish.skysync.dto.share.ShareResponse;
import com.krish.skysync.dto.share.SharedFileItemResponse;
import com.krish.skysync.dto.share.SharedFileResponse;

import java.util.List;

public interface ShareService {

    ShareResponse createShare(
            Long fileId,
            Long userId,
            Long expirationHours
    );

    SharedFileResponse getSharedFile(String token);

    void revokeShare(String token, Long userId);

    List<SharedFileItemResponse> getMyShares(Long userId);
}