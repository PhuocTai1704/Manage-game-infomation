package com.dangphuoctai.GameManage.service;

import com.dangphuoctai.GameManage.payloads.dto.UserDTO;

public interface AuthService {

    UserDTO login(String username, String password);

    String register(String fullName, String username, String password);

    String generateRefreshToken(Long userId);

    UserDTO getUserByRefreshToken(String token);

}
