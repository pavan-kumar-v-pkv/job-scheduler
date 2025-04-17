package com.pkv.jobscheduler.service;

import io.minio.*;
import jakarta.annotation.PostConstruct;

// import io.minio.errors.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;

@Service
public class MinioService {

    private final MinioClient minioClient;

    @Value("${minio.bucket}")
    private String bucket;

    public MinioService(MinioClient minioClient) {
        this.minioClient = minioClient;
    }

    @PostConstruct
    public void initBucket() {
        try {
            boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
            if (!found) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
                System.out.println("✅ Bucket created: " + bucket);
            } else {
                System.out.println("✅ Bucket exists: " + bucket);
            }
        } catch (Exception e) {
            throw new RuntimeException("❌ Failed to initialize bucket: " + e.getMessage(), e);
        }
    }

    public String uploadFile(MultipartFile file) throws Exception {
        String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();
        InputStream is = file.getInputStream();

        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(bucket)
                        .object(fileName)
                        .stream(is, file.getSize(), -1)
                        .contentType(file.getContentType())
                        .build()
        );
        return fileName;
    }

    public InputStream downloadFile(String fileName) throws Exception {
        return minioClient.getObject(
                GetObjectArgs.builder()
                        .bucket(bucket)
                        .object(fileName)
                        .build()
        );
    }
}
