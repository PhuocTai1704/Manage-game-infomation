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
public class GameSearchRepo {

        @PersistenceContext
        private EntityManager entityManager;

        public Page<Game> searchGames(String keyId, String gameName, Long categoryId, TypeLanguage defaultLanguage,
                        Pageable pageable) {
                SearchSession searchSession = Search.session(entityManager);

                var scope = searchSession.scope(Game.class);
                var bool = scope.predicate().bool();

                boolean hasFilter = false;

                if (gameName != null && !gameName.isBlank()) {
                        bool.must(searchSession.scope(Game.class)
                                        .predicate().match()
                                        .field("gameNames.value")
                                        .matching(gameName)
                                        .fuzzy(2)
                                        .toPredicate());

                        hasFilter = true;

                }

                if (keyId != null && !keyId.isBlank()) {
                        bool.must(scope.predicate().wildcard()
                                        .field("keyId")
                                        .matching("*" + keyId.toLowerCase() + "*")
                                        .toPredicate());
                        hasFilter = true;
                }

                if (categoryId != null) {
                        bool.must(scope.predicate().match()
                                        .fields("category.categoryId")
                                        .matching(categoryId)
                                        .toPredicate());
                        hasFilter = true;
                }

                if (defaultLanguage != null) {
                        bool.must(scope.predicate().match()
                                        .fields("defaultLanguage")
                                        .matching(defaultLanguage)
                                        .toPredicate());
                        hasFilter = true;
                }

                var predicate = hasFilter
                                ? bool.toPredicate()
                                : scope.predicate().matchAll().toPredicate(); // ← nếu không có filter thì matchAll

                SearchResult<Game> result = searchSession.search(Game.class)
                                .where(predicate)
                                .sort(f -> f.score())
                                .fetch((int) pageable.getOffset(), pageable.getPageSize());

                return new PageImpl<>(result.hits(), pageable, result.total().hitCount());
        }
}
