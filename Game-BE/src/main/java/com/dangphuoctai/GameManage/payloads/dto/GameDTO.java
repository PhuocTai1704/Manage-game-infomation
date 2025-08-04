package com.dangphuoctai.GameManage.payloads.dto;

import java.util.List;

import com.dangphuoctai.GameManage.enums.TypeLanguage;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GameDTO {
    private Long gameId;

    @NotBlank(message = "Key ID cannot be blank")
    private String keyId;
    
    @NotNull(message = "Category cannot be null")
    private CategoryDTO category;

    @NotNull(message = "Default language cannot be null")
    private TypeLanguage defaultLanguage;

    @NotNull(message = "Game names cannot be null")
    @Size(min = 1, message = "At least one game name is required")
    private List<GameNameDTO> gameNames;
}
