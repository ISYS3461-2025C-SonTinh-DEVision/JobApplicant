package com.DEVision.JobApplicant.common.storage.service;

import com.DEVision.JobApplicant.common.storage.dto.FileUploadResult;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    FileUploadResult uploadFile(MultipartFile file, String folderName);

    void deleteFile(String publicId, String resourceType);
}
