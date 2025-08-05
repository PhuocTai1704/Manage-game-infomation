package com.dangphuoctai.GameManage.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dangphuoctai.GameManage.entity.User;

public interface UserRepo extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

}
