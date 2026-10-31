package com.larose.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.larose.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private static final String ADMIN = "ADMIN";

    private final JwtAuthFilter jwtAuthFilter;
    private final ObjectMapper objectMapper;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable)
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(eh -> eh
                .authenticationEntryPoint((req, res, ex) ->
                    writeError(res, HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập để thực hiện thao tác này"))
                .accessDeniedHandler((req, res, ex) ->
                    writeError(res, HttpStatus.FORBIDDEN, "Bạn không có quyền thực hiện thao tác này")))
            // Rule cụ thể đặt trước rule chung (rule đầu tiên khớp sẽ được áp dụng)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/error").permitAll()

                // 1. Quản trị
                .requestMatchers("/api/admin/**", "/api/statistical/**", "/api/vat-report/**").hasRole(ADMIN)
                .requestMatchers(HttpMethod.GET, "/api/reviews/admin").hasRole(ADMIN)
                .requestMatchers("/api/reviews/response", "/api/reviews/response/**").hasRole(ADMIN)
                .requestMatchers(HttpMethod.PUT, "/api/reviews/{id}/status").hasRole(ADMIN)
                .requestMatchers(HttpMethod.POST, "/api/rooms").hasRole(ADMIN)
                .requestMatchers(HttpMethod.PUT, "/api/rooms/**").hasRole(ADMIN)
                .requestMatchers(HttpMethod.DELETE, "/api/rooms/**").hasRole(ADMIN)
                .requestMatchers(HttpMethod.GET, "/api/services").hasRole(ADMIN)
                .requestMatchers(HttpMethod.POST, "/api/services").hasRole(ADMIN)
                .requestMatchers(HttpMethod.PUT, "/api/services/{id}").hasRole(ADMIN)
                .requestMatchers(HttpMethod.DELETE, "/api/services/{id}").hasRole(ADMIN)

                // 2. Công khai
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/uploads/**", "/images/**").permitAll()
                .requestMatchers("/v3/api-docs", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                .requestMatchers(HttpMethod.GET,
                    "/api/rooms", "/api/rooms/types", "/api/rooms/{id}",
                    "/api/reviews", "/api/reviews/{id}", "/api/reviews/booking/{bookingId}",
                    "/api/services/active", "/api/services/{id}",
                    "/api/booking/suggestions", "/api/booking/booking-date/{roomId}"
                ).permitAll()
                .requestMatchers(HttpMethod.POST, "/api/booking/check-availability", "/api/chatbot/ask").permitAll()

                // 3. Còn lại: phải đăng nhập (quyền sở hữu kiểm tra ở tầng service)
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(UserDetailsService userDetailsService,
                                                       PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(provider);
    }

    private void writeError(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getOutputStream(), ErrorResponse.of(status, message));
    }
}
