package com.dangphuoctai.GameManage.controller;

import com.dangphuoctai.GameManage.payloads.dto.GameDTO;
import com.dangphuoctai.GameManage.payloads.response.GameResponse;
import com.dangphuoctai.GameManage.enums.TypeLanguage;
import com.dangphuoctai.GameManage.service.GameService;
import com.dangphuoctai.GameManage.payloads.dto.GameNameDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.dangphuoctai.GameManage.payloads.dto.CategoryDTO;

@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(GameController.class)
public class GameControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GameService gameService;

    // Thành công
    @Test
    void testCreateGame_Success() throws Exception {
        GameNameDTO gameNameDTO = new GameNameDTO(null, TypeLanguage.JA, "Test Game");
        CategoryDTO categoryDTO = new CategoryDTO(2L, "Action");
        GameDTO gameDTO = new GameDTO(1L, "GAME001", categoryDTO, TypeLanguage.JA,
                Collections.singletonList(gameNameDTO));

        when(gameService.createGame(any(GameDTO.class))).thenReturn(gameDTO);

        mockMvc.perform(post("/api/admin/games")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                        "{\"gameId\":1,\"keyId\":\"GAME001\",\"category\":{\"categoryId\":2,\"name\":\"Action\"},\"defaultLanguage\":\"JA\",\"gameNames\":[{\"language\":\"JA\",\"value\":\"Test Game\"}]}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.gameId").value(1L));
    }

    // Thiếu keyId
    @Test
    void testCreateGame_MissingKeyId() throws Exception {
        mockMvc.perform(post("/api/admin/games")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                        "{\"gameId\":1,\"category\":{\"categoryId\":2,\"name\":\"Action\"},\"defaultLanguage\":\"JA\",\"gameNames\":[{\"language\":\"JA\",\"value\":\"Test Game\"}]}"))
                .andExpect(status().isBadRequest());
    }

    // Thiếu category
    @Test
    void testCreateGame_MissingCategory() throws Exception {
        mockMvc.perform(post("/api/admin/games")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                        "{\"gameId\":1,\"keyId\":\"GAME001\",\"defaultLanguage\":\"JA\",\"gameNames\":[{\"language\":\"JA\",\"value\":\"Test Game\"}]}"))
                .andExpect(status().isBadRequest());
    }

    // Thiếu defaultLanguage
    @Test
    void testCreateGame_MissingDefaultLanguage() throws Exception {
        mockMvc.perform(post("/api/admin/games")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                        "{\"gameId\":1,\"keyId\":\"GAME001\",\"category\":{\"categoryId\":2,\"name\":\"Action\"},\"gameNames\":[{\"language\":\"JA\",\"value\":\"Test Game\"}]}"))
                .andExpect(status().isBadRequest());
    }

    // Thiếu gameNames
    @Test
    void testCreateGame_MissingGameNames() throws Exception {
        mockMvc.perform(post("/api/admin/games")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                        "{\"gameId\":1,\"keyId\":\"GAME001\",\"category\":{\"categoryId\":2,\"name\":\"Action\"},\"defaultLanguage\":\"JA\"}"))
                .andExpect(status().isBadRequest());
    }

    // gameNames rỗng
    @Test
    void testCreateGame_EmptyGameNames() throws Exception {
        mockMvc.perform(post("/api/admin/games")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                        "{\"gameId\":1,\"keyId\":\"GAME001\",\"category\":{\"categoryId\":2,\"name\":\"Action\"},\"defaultLanguage\":\"JA\",\"gameNames\":[]}"))
                .andExpect(status().isBadRequest());
    }

    // Update thành công
    @Test
    void testUpdateGame_Success() throws Exception {
        GameNameDTO gameNameDTO = new GameNameDTO(null, TypeLanguage.EN, "Updated Game");
        CategoryDTO categoryDTO = new CategoryDTO(2L, "Action");
        GameDTO gameDTO = new GameDTO(1L, "GAME001", categoryDTO, TypeLanguage.EN,
                Collections.singletonList(gameNameDTO));

        when(gameService.updateGame(any(GameDTO.class))).thenReturn(gameDTO);

        mockMvc.perform(put("/api/admin/games")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                        "{\"gameId\":1,\"keyId\":\"GAME001\",\"category\":{\"categoryId\":2,\"name\":\"Action\"},\"defaultLanguage\":\"EN\",\"gameNames\":[{\"language\":\"EN\",\"value\":\"Updated Game\"}]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gameId").value(1L));
    }

    // Update thiếu category
    @Test
    void testUpdateGame_MissingCategory() throws Exception {
        mockMvc.perform(put("/api/admin/games")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                        "{\"gameId\":1,\"keyId\":\"GAME001\",\"defaultLanguage\":\"EN\",\"gameNames\":[{\"language\":\"EN\",\"value\":\"Updated Game\"}]}"))
                .andExpect(status().isBadRequest());
    }

    // Update thiếu keyId
    @Test
    void testUpdateGame_MissingKeyId() throws Exception {
        mockMvc.perform(put("/api/admin/games")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                        "{\"gameId\":1,\"category\":{\"categoryId\":2,\"name\":\"Action\"},\"defaultLanguage\":\"EN\",\"gameNames\":[{\"language\":\"EN\",\"value\":\"Updated Game\"}]}"))
                .andExpect(status().isBadRequest());
    }

    // Lấy game theo id - thành công
    @Test
    void testGetGameById_Success() throws Exception {
        GameNameDTO gameNameDTO = new GameNameDTO(null, TypeLanguage.JA, "Test Game");
        CategoryDTO categoryDTO = new CategoryDTO(2L, "Action");
        GameDTO gameDTO = new GameDTO(1L, "GAME001", categoryDTO, TypeLanguage.JA,
                Collections.singletonList(gameNameDTO));

        when(gameService.getGameById(1L)).thenReturn(gameDTO);

        mockMvc.perform(get("/api/public/games/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gameId").value(1L))
                .andExpect(jsonPath("$.keyId").value("GAME001"));
    }

    // Lấy game theo id - không tìm thấy
    @Test
    void testGetGameById_NotFound() throws Exception {
        when(gameService.getGameById(99L))
                .thenThrow(new com.dangphuoctai.GameManage.exceptions.ResourceNotFoundException("Game", "id", 99L));

        mockMvc.perform(get("/api/public/games/99"))
                .andExpect(status().isNotFound());
    }

    // Lấy danh sách game - thành công
    @Test
    void testGetAllGames_Success() throws Exception {
        GameResponse response = new GameResponse();
        when(gameService.getAllGames(any(), any(), any(), any(), anyInt(), anyInt(), anyString(), anyString()))
                .thenReturn(response);

        mockMvc.perform(get("/api/public/games"))
                .andExpect(status().isOk());
    }

    // Lấy danh sách game - với filter
    @Test
    void testGetAllGames_WithFilter() throws Exception {
        GameResponse response = new GameResponse();
        when(gameService.getAllGames(eq("GAME001"), eq("Test Game"), eq(TypeLanguage.JA), eq(2L), anyInt(), anyInt(),
                anyString(), anyString()))
                .thenReturn(response);

        mockMvc.perform(get("/api/public/games")
                .param("keyId", "GAME001")
                .param("gameName", "Test Game")
                .param("defaultLanguage", "JA")
                .param("categoryId", "2"))
                .andExpect(status().isOk());
    }

    // Xóa game - thành công
    @Test
    void testDeleteGame_Success() throws Exception {
        doNothing().when(gameService).deleteGame(1L);

        mockMvc.perform(delete("/api/admin/games/1"))
                .andExpect(status().isNoContent());
    }

    // Xóa game - không tìm thấy
    @Test
    void testDeleteGame_NotFound() throws Exception {
        doThrow(new com.dangphuoctai.GameManage.exceptions.ResourceNotFoundException("Game", "id", 99L))
                .when(gameService).deleteGame(99L);

        mockMvc.perform(delete("/api/admin/games/99"))
                .andExpect(status().isNotFound());
    }
}