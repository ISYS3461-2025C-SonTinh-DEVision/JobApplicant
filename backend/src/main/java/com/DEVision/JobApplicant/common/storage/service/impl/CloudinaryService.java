package com.DEVision.JobApplicant.common.storage.service.impl;

import com.DEVision.JobApplicant.common.storage.dto.FileStorageException;
import com.DEVision.JobApplicant.common.storage.dto.FileUploadResult;
import com.DEVision.JobApplicant.common.storage.service.FileStorageService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService implements FileStorageService {

    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    @Override
    public FileUploadResult uploadFile(MultipartFile file, String folderName) {
        if (file == null || file.isEmpty()) {
            throw new FileStorageException("File must not be null or empty");
        }

        // Determine resource type based on file content type
        String contentType = file.getContentType();
        
        // Determine resource type:
        // - PDFs: Use 'auto' - Cloudinary will handle it appropriately
        // - Videos: Use 'video' type
        // - Images: Use 'auto' (default)
        String resourceType = "auto";
        boolean isVideo = contentType != null && contentType.startsWith("video/");
        
        if (isVideo) {
            resourceType = "video";
        }

        Map<String, Object> options = ObjectUtils.asMap("resource_type", resourceType);
        if (StringUtils.hasText(folderName)) {
            options.put("folder", folderName);
        }

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), options);
            String secureUrl = (String) uploadResult.get("secure_url");
            String publicId = (String) uploadResult.get("public_id");
            String actualResourceType = (String) uploadResult.get("resource_type");

            if (!StringUtils.hasText(secureUrl) || !StringUtils.hasText(publicId) || !StringUtils.hasText(actualResourceType)) {
                throw new FileStorageException("Cloudinary upload returned incomplete data");
            }

            return new FileUploadResult(secureUrl, publicId, actualResourceType);
        } catch (IOException ex) {
            throw new FileStorageException("Failed to upload file to Cloudinary", ex);
        }
    }


    @Override
    public void deleteFile(String publicId, String resourceType) {
        if (!StringUtils.hasText(publicId)) {
            throw new FileStorageException("Public ID must not be null or blank");
        }
        if (!StringUtils.hasText(resourceType)) {
            throw new FileStorageException("Resource type must not be null or blank");
        }

        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", resourceType));
        } catch (IOException ex) {
            throw new FileStorageException("Failed to delete file from Cloudinary: " + publicId, ex);
        }
    }
}
