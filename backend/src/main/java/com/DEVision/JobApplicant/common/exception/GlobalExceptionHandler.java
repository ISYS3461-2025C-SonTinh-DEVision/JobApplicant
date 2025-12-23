package com.DEVision.JobApplicant.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "File size exceeds maximum limit. Maximum file size is 10MB per file, 20MB total.");
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(error);
    }
    
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<Map<String, String>> handleHttpMediaTypeNotSupported(HttpMediaTypeNotSupportedException e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Invalid content type. Please use multipart/form-data for file uploads.");
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).body(error);
    }
}

