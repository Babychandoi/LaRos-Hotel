package com.larose.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.larose.exception.ApiException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Trợ lý ảo: gọi Gemini ở phía server để API key không lộ ra trình duyệt.
 * Endpoint công khai nên có giới hạn số câu hỏi theo từng client.
 */
@Slf4j
@Service
public class ChatbotService {

    private static final String ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent";
    private static final String SYSTEM_PROMPT = """
            Bạn là trợ lý ảo của khách sạn La Rosé, một khách sạn nghỉ dưỡng sang trọng với phong cách nữ tính và tinh tế.
            Nhiệm vụ của bạn là tư vấn cho khách hàng về các dịch vụ đặt phòng.
            Hãy trả lời thân thiện, chuyên nghiệp, ngắn gọn, tập trung vào:
            1. Các loại phòng và giá phòng.
            2. Tiện ích khách sạn (spa, nhà hàng, hồ bơi, phòng gym).
            3. Quy trình đặt phòng (chọn phòng, điền thông tin, thanh toán, nhận xác nhận).
            4. Các chương trình khuyến mãi (nếu khách hỏi).
            Chỉ trả lời các câu hỏi liên quan đến khách sạn và du lịch. Sử dụng emoji và Markdown để trình bày.""";

    private static final long WINDOW_MS = 60_000;
    private static final int MAX_REQUESTS_PER_WINDOW = 10;
    private static final int MAX_TRACKED_CLIENTS = 10_000;

    private final RestClient restClient = RestClient.create();
    private final Map<String, Deque<Long>> recentRequests = new ConcurrentHashMap<>();

    @Value("${gemini.api-key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-2.5-flash}")
    private String model;

    public String ask(String clientId, String question) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "CHATBOT_DISABLED",
                    "Trợ lý ảo chưa được cấu hình. Vui lòng liên hệ khách sạn để được hỗ trợ.");
        }
        checkRateLimit(clientId);

        Map<String, Object> body = Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text", SYSTEM_PROMPT))),
                "contents", List.of(Map.of("role", "user", "parts", List.of(Map.of("text", question)))));
        try {
            JsonNode response = restClient.post()
                    .uri(ENDPOINT.formatted(model))
                    .header("x-goog-api-key", apiKey)
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);
            String reply = response == null ? "" : response.path("candidates").path(0)
                    .path("content").path("parts").path(0).path("text").asText("");
            return reply.isBlank() ? "Xin lỗi, tôi chưa thể hỗ trợ câu hỏi này. 💖" : reply;
        } catch (RestClientException e) {
            log.warn("Gọi Gemini thất bại: {}", e.getMessage());
            throw new ApiException(HttpStatus.BAD_GATEWAY, "CHATBOT_UPSTREAM_ERROR",
                    "Trợ lý ảo đang bận, bạn vui lòng thử lại sau nhé!");
        }
    }

    private void checkRateLimit(String clientId) {
        long now = System.currentTimeMillis();
        if (recentRequests.size() > MAX_TRACKED_CLIENTS) {
            recentRequests.values().removeIf(q -> q.isEmpty() || now - q.peekLast() > WINDOW_MS);
        }
        Deque<Long> queue = recentRequests.computeIfAbsent(clientId, k -> new ArrayDeque<>());
        synchronized (queue) {
            while (!queue.isEmpty() && now - queue.peekFirst() > WINDOW_MS) {
                queue.pollFirst();
            }
            if (queue.size() >= MAX_REQUESTS_PER_WINDOW) {
                throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "CHATBOT_RATE_LIMITED",
                        "Bạn hỏi hơi nhanh, vui lòng thử lại sau ít phút nhé!");
            }
            queue.addLast(now);
        }
    }
}
