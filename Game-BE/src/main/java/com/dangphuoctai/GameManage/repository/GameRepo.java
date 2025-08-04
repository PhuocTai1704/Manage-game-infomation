package com.dangphuoctai.GameManage.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dangphuoctai.GameManage.entity.Game;

public interface GameRepo extends JpaRepository<Game, Long> {

    boolean existsByKeyId(String keyId);

    boolean existsByCategoryCategoryId(Long categoryId);

}
