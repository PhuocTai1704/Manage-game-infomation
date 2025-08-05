package com.dangphuoctai.GameManage.service.impl;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.dangphuoctai.GameManage.entity.RefreshToken;
import com.dangphuoctai.GameManage.entity.User;
import com.dangphuoctai.GameManage.exceptions.APIException;
import com.dangphuoctai.GameManage.payloads.dto.UserDTO;
import com.dangphuoctai.GameManage.repository.RefreshTokenRepo;
import com.dangphuoctai.GameManage.repository.UserRepo;
import com.dangphuoctai.GameManage.service.AuthService;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private RefreshTokenRepo refreshTokenRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public UserDTO login(String username, String password) {
        User user = userRepo.findByUsername(username).orElseThrow(() -> new APIException("Account does not exist"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new APIException("Incorrect password");
        }

        return modelMapper.map(user, UserDTO.class);

    }

    @Override
    public String register(String fullName, String username, String password) {
        if (userRepo.existsByUsername(username)) {
            throw new APIException("Username already exists");
        }
        User user = new User();
        user.setFullName(fullName);
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user = userRepo.save(user);

        return "User registered successfully";
    }

    @Override
    public String generateRefreshToken(Long userId) {
        if (userId == null) {
            throw new APIException("User ID must not be null");
        }

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new APIException("User does not exist"));

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(generateSecureRefreshToken());
        refreshToken.setExpiryDate(LocalDateTime.now().plusDays(7));

        user.getRefreshTokens().add(refreshToken);

        refreshTokenRepo.save(refreshToken);

        return refreshToken.getToken();

    }

    public String generateSecureRefreshToken() {
        SecureRandom secureRandom = new SecureRandom();
        byte[] tokenBytes = new byte[64]; // 64 bytes = 512 bits
        secureRandom.nextBytes(tokenBytes);

        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }

    @Override
    public UserDTO getUserByRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepo.findByToken(token)
                .orElseThrow(() -> new APIException("Invalid refresh token"));

        if (refreshToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new APIException("Refresh token has expired");
        }

        User user = refreshToken.getUser();

        return modelMapper.map(user, UserDTO.class);

    }

}
