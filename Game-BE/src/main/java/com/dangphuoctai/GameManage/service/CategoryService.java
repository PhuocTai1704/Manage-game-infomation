package com.dangphuoctai.GameManage.service;

import com.dangphuoctai.GameManage.payloads.dto.CategoryDTO;
import com.dangphuoctai.GameManage.payloads.response.CategoryResponse;

public interface CategoryService {

    CategoryDTO createCategory(CategoryDTO categoryDTO);

    CategoryDTO updateCategory(CategoryDTO categoryDTO);

    CategoryDTO getCategoryById(Long categoryId);

    CategoryResponse getAllCategories(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);

    void deleteCategory(Long categoryId);

}
