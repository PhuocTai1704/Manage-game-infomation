package com.dangphuoctai.GameManage.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.dangphuoctai.GameManage.entity.Category;
import com.dangphuoctai.GameManage.exceptions.APIException;
import com.dangphuoctai.GameManage.exceptions.ResourceNotFoundException;
import com.dangphuoctai.GameManage.payloads.dto.CategoryDTO;
import com.dangphuoctai.GameManage.payloads.response.CategoryResponse;
import com.dangphuoctai.GameManage.repository.CategoryRepo;
import com.dangphuoctai.GameManage.repository.GameRepo;
import com.dangphuoctai.GameManage.service.CategoryService;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryRepo categoryRepo;

    @Autowired
    private GameRepo gameRepo;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        if (categoryRepo.existsByName(categoryDTO.getName())) {
            throw new IllegalArgumentException("Category name already exists.");
        }
        Category category = new Category();
        category.setName(categoryDTO.getName());
        category = categoryRepo.save(category);

        return modelMapper.map(category, CategoryDTO.class);
    }

    @Override
    public CategoryDTO updateCategory(CategoryDTO categoryDTO) {
        Category category = categoryRepo.findById(categoryDTO.getCategoryId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Category", "categoryId", categoryDTO.getCategoryId()));
        category.setName(categoryDTO.getName());
        category = categoryRepo.save(category);

        return modelMapper.map(category, CategoryDTO.class);
    }

    @Override
    public CategoryDTO getCategoryById(Long categoryId) {
        Category category = categoryRepo.findById(categoryId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Category", "categoryId", categoryId));

        return modelMapper.map(category, CategoryDTO.class);
    }

    @Override
    public CategoryResponse getAllCategories(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);
        Page<Category> pageCategories = categoryRepo.findAll(pageDetails);
        List<CategoryDTO> categoryDTOs = pageCategories.getContent().stream()
                .map(category -> modelMapper.map(category, CategoryDTO.class))
                .collect(Collectors.toList());

        CategoryResponse categoryResponse = new CategoryResponse();
        categoryResponse.setContent(categoryDTOs);
        categoryResponse.setPageNumber(pageCategories.getNumber());
        categoryResponse.setPageSize(pageCategories.getSize());
        categoryResponse.setTotalElements(pageCategories.getTotalElements());
        categoryResponse.setTotalPages(pageCategories.getTotalPages());
        categoryResponse.setLastPage(pageCategories.isLast());

        return categoryResponse;
    }

    @Override
    public void deleteCategory(Long categoryId) {
        if (!categoryRepo.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category", "categoryId", categoryId);
        }
        if (gameRepo.existsByCategoryCategoryId(categoryId)) {
            throw new APIException("Cannot delete category with existing games.");
        }
        categoryRepo.deleteById(categoryId);
    }

}
