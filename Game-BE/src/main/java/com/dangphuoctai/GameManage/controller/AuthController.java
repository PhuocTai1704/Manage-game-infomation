package com.dangphuoctai.GameManage.controller;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dangphuoctai.GameManage.payloads.dto.UserDTO;
import com.dangphuoctai.GameManage.payloads.request.LoginRequest;
import com.dangphuoctai.GameManage.payloads.request.RegisterRequest;
import com.dangphuoctai.GameManage.payloads.response.AuthResponse;
import com.dangphuoctai.GameManage.security.JWTUtil;
import com.dangphuoctai.GameManage.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JWTUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        UserDTO userDTO = authService.login(loginRequest.getUsername(), loginRequest.getPassword());

        // Generate refresh token
        String refreshToken = authService.generateRefreshToken(userDTO.getUserId());

        // Generate access token
        String accessToken = jwtUtil.generateToken(userDTO);

        // Create HTTP-only cookie for refresh token
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(Duration.ofDays(7))
                .sameSite("Strict")
                .build();

        // Create response
        AuthResponse authResponse = new AuthResponse();
        authResponse.setAccessToken(accessToken);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(authResponse);

    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            String result = authService.register(
                    registerRequest.getFullName(),
                    registerRequest.getUsername(),
                    registerRequest.getPassword());

            AuthResponse response = new AuthResponse();
            response.setMessage("Registration successful");

            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } catch (Exception e) {
            AuthResponse response = new AuthResponse();
            response.setMessage(e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponse> refreshToken(
            @CookieValue(name = "refreshToken", required = false) String refreshTokenFromCookie,
            @RequestBody(required = false) String refreshTokenFromBody) {
        try {
            String refreshToken = refreshTokenFromCookie != null ? refreshTokenFromCookie : refreshTokenFromBody;

            if (refreshToken == null) {
                throw new RuntimeException("Refresh token is required");
            }

            UserDTO userDTO = authService.getUserByRefreshToken(refreshToken);

            // Generate new access token
            String newAccessToken = jwtUtil.generateToken(userDTO);

            AuthResponse authResponse = new AuthResponse();
            authResponse.setAccessToken(newAccessToken);
            authResponse.setMessage("Token refreshed successfully");
            return ResponseEntity.ok()
                    .body(authResponse);

        } catch (Exception e) {
            AuthResponse authResponse = new AuthResponse();
            authResponse.setAccessToken(null);
            authResponse.setMessage(e.getMessage());
            return new ResponseEntity<>(authResponse, HttpStatus.UNAUTHORIZED);
        }
    }

}
