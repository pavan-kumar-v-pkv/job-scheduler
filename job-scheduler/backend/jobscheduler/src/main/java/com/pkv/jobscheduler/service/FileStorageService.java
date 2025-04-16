package com.pkv.jobscheduler.service;

import io.minio.*;
// import io.minio.errors.MinioException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final MinioClient minioClient;

    @Value("${minio.bucket}")
    private String bucket;

    public void uploadFile(String filename, MultipartFile file) {
        try {
            InputStream is = file.getInputStream();

            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(filename)
                    .stream(is, file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build());

        } catch (Exception e) {
            throw new RuntimeException("❌ Upload to MinIO failed: " + e.getMessage(), e);
        }
    }

    public InputStream downloadFile(String filename) {
        try {
            return minioClient.getObject(GetObjectArgs.builder()
                    .bucket(bucket)
                    .object(filename)
                    .build());
        } catch (Exception e) {
            throw new RuntimeException("❌ Download from MinIO failed: " + e.getMessage(), e);
        }
    }
}
