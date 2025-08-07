package com.dangphuoctai.GameManage.controller;

import com.dangphuoctai.GameManage.controller.CategoryController;
import com.dangphuoctai.GameManage.payloads.dto.CategoryDTO;
import com.dangphuoctai.GameManage.payloads.response.CategoryResponse;
import com.dangphuoctai.GameManage.service.CategoryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doNothing;

@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(CategoryController.class)
public class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CategoryService categoryService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testCreateCategory() throws Exception {
        CategoryDTO categoryDTO = new CategoryDTO();
        categoryDTO.setCategoryId(1L);
        categoryDTO.setName("Action");

        when(categoryService.createCategory(any(CategoryDTO.class))).thenReturn(categoryDTO);

        mockMvc.perform(post("/api/admin/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"categoryId\":1,\"name\":\"Action\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.categoryId").value(1L))
                .andExpect(jsonPath("$.name").value("Action"));
    }

    @Test
    void testUpdateCategory() throws Exception {
        CategoryDTO categoryDTO = new CategoryDTO();
        categoryDTO.setCategoryId(1L);
        categoryDTO.setName("Adventure");

        when(categoryService.updateCategory(any(CategoryDTO.class))).thenReturn(categoryDTO);

        mockMvc.perform(put("/api/admin/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"categoryId\":1,\"name\":\"Adventure\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.categoryId").value(1L))
                .andExpect(jsonPath("$.name").value("Adventure"));
    }

    @Test
    void testGetCategoryById() throws Exception {
        CategoryDTO categoryDTO = new CategoryDTO();
        categoryDTO.setCategoryId(1L);
        categoryDTO.setName("Action");

        when(categoryService.getCategoryById(1L)).thenReturn(categoryDTO);

        mockMvc.perform(get("/api/public/categories/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.categoryId").value(1L))
                .andExpect(jsonPath("$.name").value("Action"));
    }

    @Test
    void testGetAllCategories() throws Exception {
        CategoryResponse response = new CategoryResponse();
        // Giả sử bạn set các thuộc tính cần thiết cho response

        when(categoryService.getAllCategories(anyInt(), anyInt(), anyString(), anyString()))
                .thenReturn(response);

        mockMvc.perform(get("/api/public/categories"))
                .andExpect(status().isOk());
        // Có thể kiểm tra thêm các trường trong response nếu cần
    }

    @Test
    void testDeleteCategory() throws Exception {
        doNothing().when(categoryService).deleteCategory(1L);

        mockMvc.perform(delete("/api/admin/categories/1"))
                .andExpect(status().isNoContent());
    }
}
