package com.dangphuoctai.GameManage.service.impl;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.Map;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.dangphuoctai.GameManage.entity.Category;
import com.dangphuoctai.GameManage.entity.Game;
import com.dangphuoctai.GameManage.entity.GameName;
import com.dangphuoctai.GameManage.enums.TypeLanguage;
import com.dangphuoctai.GameManage.exceptions.APIException;
import com.dangphuoctai.GameManage.exceptions.ResourceNotFoundException;
import com.dangphuoctai.GameManage.payloads.dto.GameDTO;
import com.dangphuoctai.GameManage.payloads.dto.GameNameDTO;
import com.dangphuoctai.GameManage.payloads.response.GameResponse;
import com.dangphuoctai.GameManage.repository.CategoryRepo;
import com.dangphuoctai.GameManage.repository.GameNameRepo;
import com.dangphuoctai.GameManage.repository.GameRepo;
import com.dangphuoctai.GameManage.repository.GameSearchRepo;
import com.dangphuoctai.GameManage.service.GameService;
import com.dangphuoctai.GameManage.utils.CheckString;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class GameServiceImpl implements GameService {

    @Autowired
    private GameRepo gameRepo;

    @Autowired
    private GameSearchRepo gameSearchRepo;

    @Autowired
    private GameNameRepo gameNameRepo;

    @Autowired
    private CategoryRepo categoryRepo;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public GameDTO createGame(GameDTO gameDTO) {
        if (gameDTO.getCategory() == null || gameDTO.getCategory().getCategoryId() == null) {
            throw new IllegalArgumentException("Category must not be null");
        }
        Long categoryId = gameDTO.getCategory().getCategoryId();
        Category category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "categoryId", categoryId));
        if (!CheckString.isValidKeyId(gameDTO.getKeyId())) {
            throw new IllegalArgumentException("Invalid keyId format.");
        }
        if (gameRepo.existsByKeyId(gameDTO.getKeyId())) {
            throw new IllegalArgumentException("Game with this keyId already exists.");
        }
        if (!checkGameName(gameDTO.getGameNames())) {
            throw new IllegalArgumentException("Invalid game names.");
        }
        boolean hasDefaultLanguage = gameDTO.getGameNames().stream()
                .anyMatch(gameName -> gameName.getLanguage() == gameDTO.getDefaultLanguage());
        if (!hasDefaultLanguage) {
            throw new IllegalArgumentException("Default language must be included in game names.");
        }
        Game game = new Game();
        game.setKeyId(gameDTO.getKeyId());
        game.setCategory(category);
        List<GameName> gameNames = gameDTO.getGameNames().stream()
                .map(gameNameDTO -> {
                    GameName gameName = new GameName();
                    gameName.setLanguage(gameNameDTO.getLanguage());
                    gameName.setValue(gameNameDTO.getValue());
                    gameName.setGame(game);
                    return gameName;
                }).collect(Collectors.toList());
        game.setGameNames(gameNames);
        game.setDefaultLanguage(gameDTO.getDefaultLanguage());
        gameRepo.save(game);

        return modelMapper.map(game, GameDTO.class);
    }

    @Override
    public GameDTO updateGame(GameDTO gameDTO) {
        if (gameDTO.getGameId() == null) {
            throw new APIException("Game ID must not be null for update");
        }
        Game game = gameRepo.findById(gameDTO.getGameId())
                .orElseThrow(() -> new ResourceNotFoundException("Game", "gameId", gameDTO.getGameId()));

        if (gameDTO.getCategory() == null || gameDTO.getCategory().getCategoryId() == null) {
            throw new IllegalArgumentException("Category must not be null");
        }
        Long categoryId = gameDTO.getCategory().getCategoryId();
        Category category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "categoryId", categoryId));

        if (!CheckString.isValidKeyId(gameDTO.getKeyId())) {
            throw new IllegalArgumentException("Invalid keyId format.");
        }

        if (!gameDTO.getKeyId().equals(game.getKeyId()) && gameRepo.existsByKeyId(gameDTO.getKeyId())) {
            throw new IllegalArgumentException("Game with this keyId already exists.");
        }

        if (!checkGameName(gameDTO.getGameNames())) {
            throw new IllegalArgumentException("Invalid game names.");
        }

        boolean hasDefaultLanguage = gameDTO.getGameNames().stream()
                .anyMatch(gameName -> gameName.getLanguage() == gameDTO.getDefaultLanguage());
        if (!hasDefaultLanguage) {
            throw new IllegalArgumentException("Default language must be included in game names.");
        }

        game.setKeyId(gameDTO.getKeyId());
        game.setCategory(category);
        game.setDefaultLanguage(gameDTO.getDefaultLanguage());

        // Update game names
        Map<TypeLanguage, GameName> existingGameNamesMap = game.getGameNames().stream()
                .collect(Collectors.toMap(GameName::getLanguage, gn -> gn));
        // Update or add new game names
        for (GameNameDTO gameNameDTO : gameDTO.getGameNames()) {
            GameName existing = existingGameNamesMap.remove(gameNameDTO.getLanguage());
            if (existing != null) {
                existing.setValue(gameNameDTO.getValue());
            } else {
                GameName newGameName = new GameName();
                newGameName.setLanguage(gameNameDTO.getLanguage());
                newGameName.setValue(gameNameDTO.getValue());
                newGameName.setGame(game);
                game.getGameNames().add(newGameName);
            }
        }
        // Remove game names that are no longer present
        for (GameName toRemove : existingGameNamesMap.values()) {
            game.getGameNames().remove(toRemove);
        }

        Game updatedGame = gameRepo.save(game);

        return modelMapper.map(updatedGame, GameDTO.class);
    }

    @Override
    public GameDTO getGameById(Long gameId) {
        Game game = gameRepo.findById(gameId)
                .orElseThrow(() -> new ResourceNotFoundException("Game", "gameId", gameId));

        return modelMapper.map(game, GameDTO.class);
    }

    @Override
    public GameResponse getAllGames(String keyId, String gameName, TypeLanguage defaultLanguage, Long categoryId,
            Integer pageNumber, Integer pageSize, String sortBy,
            String sortOrder) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);
        // Specification<Game> specificationGame = GameSpecification.filter(keyId,
        // gameName, categoryId, defaultLanguage);
        // Page<Game> pageGames = gameSearch.searchGames(keyId, gameName, categoryId,
        // defaultLanguage, pageDetails);
        // Page<Game> pageGames = gameRepo.findAll(specificationGame, pageDetails);
        Page<Game> pageGames = gameSearchRepo.searchGames(keyId, gameName, categoryId, defaultLanguage, pageDetails);
        List<GameDTO> gameDTOs = pageGames.getContent().stream()
                .map(game -> modelMapper.map(game, GameDTO.class))
                .collect(Collectors.toList());

        GameResponse gameResponse = new GameResponse();
        gameResponse.setContent(gameDTOs);
        gameResponse.setPageNumber(pageGames.getNumber());
        gameResponse.setPageSize(pageGames.getSize());
        gameResponse.setTotalElements(pageGames.getTotalElements());
        gameResponse.setTotalPages(pageGames.getTotalPages());
        gameResponse.setLastPage(pageGames.isLast());

        return gameResponse;
    }

    @Override
    public void deleteGame(Long gameId) {
        if (!gameRepo.existsById(gameId)) {
            throw new ResourceNotFoundException("Game", "gameId", gameId);
        }
        gameRepo.deleteById(gameId);
    }

    private boolean checkGameName(List<GameNameDTO> gameNameDTOs) {
        if (gameNameDTOs == null || gameNameDTOs.isEmpty() || gameNameDTOs.size() > 3) {
            return false;
        }
        Set<TypeLanguage> languageSet = new HashSet<>();
        for (GameNameDTO name : gameNameDTOs) {
            TypeLanguage lang = name.getLanguage();
            if (lang == null) {
                return false;
            }
            if (!languageSet.add(lang)) {
                return false;
            }
        }
        return true;

    }

}
