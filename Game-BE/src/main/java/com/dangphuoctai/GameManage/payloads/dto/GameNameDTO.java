package com.dangphuoctai.GameManage.payloads.dto;

import com.dangphuoctai.GameManage.enums.TypeLanguage;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GameNameDTO {
    private Long gameNameId;

    @NotNull(message = "Language must be specified")
    private TypeLanguage language;

    @NotBlank(message = "Game name cannot be empty")
    private String value;

}
