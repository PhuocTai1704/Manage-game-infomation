package com.dangphuoctai.GameManage.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.hibernate.search.engine.search.query.SearchResult;
import org.hibernate.search.mapper.orm.Search;
import org.hibernate.search.mapper.orm.session.SearchSession;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Repository;

import com.dangphuoctai.GameManage.entity.Game;
import com.dangphuoctai.GameManage.enums.TypeLanguage;

@Repository
public class GameSearchRepository {

    @PersistenceContext
    private EntityManager entityManager;

    public Page<Game> searchGames(String keyId, String gameName, Long categoryId, TypeLanguage defaultLanguage,
            Pageable pageable) {
        SearchSession searchSession = Search.session(entityManager);

        // Build the boolean predicate
        var bool = searchSession.scope(Game.class).predicate().bool();

        if (gameName != null && !gameName.isBlank()) {
            bool.must(searchSession.scope(Game.class)
                    .predicate().match()
                    .fields("gameNames.value")
                    .matching(gameName)
                    .toPredicate());
        }

        if (keyId != null && !keyId.isBlank()) {
            bool.must(searchSession.scope(Game.class)
                    .predicate().match()
                    .fields("keyId")
                    .matching(keyId)
                    .toPredicate());
        }

        if (categoryId != null) {
            bool.must(searchSession.scope(Game.class)
                    .predicate().match()
                    .fields("category.categoryId")
                    .matching(categoryId)
                    .toPredicate());
        }

        if (defaultLanguage != null) {
            bool.must(searchSession.scope(Game.class)
                    .predicate().match()
                    .fields("defaultLanguage")
                    .matching(defaultLanguage)
                    .toPredicate());
        }

        SearchResult<Game> result = searchSession.search(Game.class)
                .where(bool.toPredicate())
                .sort(f -> f.score()) // hoặc .sort(f -> f.field("fieldName")) nếu muốn sort theo field
                .fetch((int) pageable.getOffset(), pageable.getPageSize());

        return new PageImpl<>(result.hits(), pageable, result.total().hitCount());
    }
}
