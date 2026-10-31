package com.larose.controller;

import com.larose.dto.request.ChatbotRequest;
import com.larose.dto.response.ChatbotResponse;
import com.larose.service.ChatbotService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping("/ask")
    public ResponseEntity<ChatbotResponse> ask(@Valid @RequestBody ChatbotRequest request,
                                               HttpServletRequest httpRequest) {
        String reply = chatbotService.ask(httpRequest.getRemoteAddr(), request.getMessage().trim());
        return ResponseEntity.ok(new ChatbotResponse(reply));
    }
}
