package com.larose.util;

import com.cloudinary.Cloudinary;
import com.cloudinary.api.exceptions.NotFound;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * Upload ảnh phòng lên Cloudinary (thư mục "avatars"); ảnh trùng tên được dùng lại thay vì upload lại.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FileUploadUtil {
    private static final String DEFAULT_IMAGE_URL = "https://asset.cloudinary.com/dvxobkvcx/ec27e05c5476c3c95ce0d4cc48841456";

    private final Cloudinary cloudinary;

    public String uploadFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return DEFAULT_IMAGE_URL;
        }
        String publicId = "avatars/" + FilenameUtils.getBaseName(file.getOriginalFilename())
                + "." + FilenameUtils.getExtension(file.getOriginalFilename());
        try {
            try {
                Map<?, ?> existing = cloudinary.api().resource(publicId, ObjectUtils.asMap("resource_type", "image"));
                return existing.get("secure_url").toString();
            } catch (NotFound e) {
                log.debug("'{}' chưa có trên Cloudinary, tiến hành upload", publicId);
            }
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "public_id", publicId,
                    "resource_type", "image",
                    "unique_filename", false,
                    "overwrite", false));
            return uploadResult.get("secure_url").toString();
        } catch (Exception e) {
            log.error("Upload Cloudinary thất bại: {}", e.getMessage(), e);
            throw new IllegalStateException("Không upload được ảnh lên Cloudinary", e);
        }
    }
}
