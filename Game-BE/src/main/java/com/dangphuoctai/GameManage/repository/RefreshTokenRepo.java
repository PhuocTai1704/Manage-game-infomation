package com.dangphuoctai.GameManage.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dangphuoctai.GameManage.entity.RefreshToken;

public interface RefreshTokenRepo extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

}
