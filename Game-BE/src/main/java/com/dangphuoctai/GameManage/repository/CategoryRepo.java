package com.dangphuoctai.GameManage.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dangphuoctai.GameManage.entity.Category;

public interface CategoryRepo extends JpaRepository<Category, Long> {

    boolean existsByName(String name);

}
