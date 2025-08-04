package com.dangphuoctai.GameManage.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dangphuoctai.GameManage.payloads.dto.GameDTO;
import com.dangphuoctai.GameManage.payloads.response.GameResponse;
import com.dangphuoctai.GameManage.service.GameService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class GameController {

    @Autowired
    private GameService gameService;

    @PostMapping("/games")
    public ResponseEntity<GameDTO> createGame(@Valid @RequestBody GameDTO gameDTO) {
        GameDTO createdGame = gameService.createGame(gameDTO);
        return new ResponseEntity<>(createdGame, HttpStatus.CREATED);
    }

    @PutMapping("/games")
    public ResponseEntity<GameDTO> updateGame(@Valid @RequestBody GameDTO gameDTO) {
        GameDTO updatedGame = gameService.updateGame(gameDTO);
        return new ResponseEntity<>(updatedGame, HttpStatus.OK);
    }

    @GetMapping("/games/{gameId}")
    public ResponseEntity<GameDTO> getGameById(@PathVariable Long gameId) {
        GameDTO game = gameService.getGameById(gameId);
        return new ResponseEntity<>(game, HttpStatus.OK);
    }

    @GetMapping("/games")
    public ResponseEntity<GameResponse> getAllGames(
            @RequestParam(defaultValue = "0") Integer pageNumber,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "gameId") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder) {

        GameResponse games = gameService.getAllGames(pageNumber, pageSize, sortBy, sortOrder);
        return new ResponseEntity<>(games, HttpStatus.OK);
    }

    @DeleteMapping("/games/{gameId}")
    public ResponseEntity<Void> deleteGame(@PathVariable Long gameId) {
        gameService.deleteGame(gameId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
