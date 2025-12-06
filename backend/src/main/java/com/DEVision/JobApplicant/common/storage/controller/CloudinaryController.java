package com.DEVision.JobApplicant.common.storage.controller;

import com.DEVision.JobApplicant.common.storage.service.FileStorageService;
import com.DEVision.JobApplicant.common.storage.dto.FileUploadResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/cloudinary")
public class CloudinaryController {

    private final FileStorageService fileStorageService;

    public CloudinaryController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<FileUploadResult> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false) String folderName
    ) {
        FileUploadResult result = fileStorageService.uploadFile(file, folderName);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteFile(
            @RequestParam("publicId") String publicId,
            @RequestParam("resourceType") String resourceType
    ) {
        fileStorageService.deleteFile(publicId, resourceType);
        return ResponseEntity.noContent().build();
    }
}
