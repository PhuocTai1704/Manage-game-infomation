package com.dangphuoctai.GameManage.service;

import com.dangphuoctai.GameManage.enums.TypeLanguage;
import com.dangphuoctai.GameManage.payloads.dto.GameDTO;
import com.dangphuoctai.GameManage.payloads.response.GameResponse;

public interface GameService {
    GameDTO createGame(GameDTO gameDTO);

    GameDTO updateGame(GameDTO gameDTO);

    GameDTO getGameById(Long gameId);

    GameResponse getAllGames(String keyId, String gameName, TypeLanguage defaultLanguage, Long categoryId,
            Integer pageNumber, Integer pageSize, String sortBy,
            String sortOrder);

    void deleteGame(Long gameId);
}
