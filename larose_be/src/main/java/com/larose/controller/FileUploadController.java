package com.larose.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.larose.exception.NotFoundException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Upload ảnh/video (đánh giá) vào thư mục app.upload.dir, phục vụ lại qua /uploads/**.
 */
@Slf4j
@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    /** Tên thư mục con hợp lệ: chữ, số, '-', '_' (cho phép lồng bằng '/'), không có "..". */
    private static final Pattern SAFE_FOLDER = Pattern.compile("[A-Za-z0-9_-]+(/[A-Za-z0-9_-]+)*");
    private static final Pattern SAFE_EXTENSION = Pattern.compile("\\.[A-Za-z0-9]{1,10}");

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.backend.base-url}")
    private String baseUrl;

    @PostMapping("/file")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file,
                                                          @RequestParam(value = "folder", defaultValue = "general") String folder)
            throws IOException {
        validateMedia(file);
        return ResponseEntity.ok(store(file, resolveFolder(folder), folder));
    }

    /** Upload nhiều file; file lỗi được bỏ qua và liệt kê trong "errors". */
    @PostMapping("/files")
    public ResponseEntity<Map<String, Object>> uploadFiles(@RequestParam("files") MultipartFile[] files,
                                                           @RequestParam(value = "folder", defaultValue = "general") String folder)
            throws IOException {
        Path folderPath = resolveFolder(folder);
        List<Map<String, String>> uploaded = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        for (MultipartFile file : files) {
            try {
                validateMedia(file);
                uploaded.add(store(file, folderPath, folder));
            } catch (IllegalArgumentException | IOException e) {
                errors.add(file.getOriginalFilename() + ": " + e.getMessage());
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("files", uploaded);
        if (!errors.isEmpty()) {
            response.put("errors", errors);
        }
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/file")
    public ResponseEntity<Map<String, String>> deleteFile(@RequestParam("url") String url) throws IOException {
        String prefix = baseUrl + "/uploads/";
        if (!url.startsWith(prefix)) {
            throw new IllegalArgumentException("URL không thuộc thư mục upload");
        }
        Path root = uploadRoot();
        Path filePath = root.resolve(url.substring(prefix.length())).normalize();
        if (!filePath.startsWith(root) || !Files.isRegularFile(filePath)) {
            throw new NotFoundException("Không tìm thấy file");
        }
        Files.delete(filePath);
        log.info("File deleted: {}", filePath);
        return ResponseEntity.ok(Map.of("message", "File deleted successfully"));
    }

    private Map<String, String> store(MultipartFile file, Path folderPath, String folder) throws IOException {
        String originalName = file.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            String ext = originalName.substring(originalName.lastIndexOf('.'));
            extension = SAFE_EXTENSION.matcher(ext).matches() ? ext.toLowerCase() : "";
        }
        String filename = UUID.randomUUID() + extension;
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, folderPath.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
        }

        Map<String, String> info = new HashMap<>();
        info.put("url", baseUrl + "/uploads/" + folder + "/" + filename);
        info.put("filename", filename);
        info.put("originalName", originalName);
        return info;
    }

    private void validateMedia(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File rỗng");
        }
        String contentType = file.getContentType();
        if (contentType == null || !(contentType.startsWith("image/") || contentType.startsWith("video/"))) {
            throw new IllegalArgumentException("Chỉ chấp nhận file ảnh hoặc video");
        }
    }

    private Path resolveFolder(String folder) throws IOException {
        if (!SAFE_FOLDER.matcher(folder).matches()) {
            throw new IllegalArgumentException("Tên thư mục không hợp lệ: " + folder);
        }
        Path folderPath = uploadRoot().resolve(folder).normalize();
        Files.createDirectories(folderPath);
        return folderPath;
    }

    private Path uploadRoot() {
        return Paths.get(uploadDir).toAbsolutePath().normalize();
    }
}
