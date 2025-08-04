package com.dangphuoctai.GameManage.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dangphuoctai.GameManage.entity.GameName;

public interface GameNameRepo extends JpaRepository<GameName, Long> {

}
