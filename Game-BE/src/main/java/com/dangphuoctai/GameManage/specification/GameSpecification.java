package com.dangphuoctai.GameManage.specification;

import com.dangphuoctai.GameManage.entity.Game;
import com.dangphuoctai.GameManage.enums.TypeLanguage;

import jakarta.persistence.criteria.Predicate;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

public class GameSpecification {
    public static Specification<Game> filter(
            String keyId,
            String gameName,
            Long categoryId,
            TypeLanguage defaultLanguage) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (keyId != null && !keyId.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("keyId")), "%" + keyId.toLowerCase() + "%"));
            }

            if (defaultLanguage != null) {
                predicates.add(cb.equal(root.get("defaultLanguage"), defaultLanguage));
            }

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("categoryId"), categoryId));
            }

            // Đối với gameName là FullTextSearch -> sẽ filter bằng Hibernate Search, không
            // phải Specification JPA
            // Vì vậy bạn không filter "value" trong GameName tại đây

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Game> filterByIdsAndMore(List<Long> gameIds, String keyId, TypeLanguage defaultLanguage,
            Long categoryId) {
        return (root, query, cb) -> {
            var predicates = cb.conjunction();

            if (gameIds != null && !gameIds.isEmpty()) {
                predicates = cb.and(predicates, root.get("gameId").in(gameIds));
            }

            if (keyId != null && !keyId.isEmpty()) {
                predicates = cb.and(predicates,
                        cb.like(cb.lower(root.get("keyId")), "%" + keyId.toLowerCase() + "%"));
            }

            if (defaultLanguage != null) {
                predicates = cb.and(predicates,
                        cb.equal(root.get("defaultLanguage"), defaultLanguage));
            }

            if (categoryId != null) {
                predicates = cb.and(predicates,
                        cb.equal(root.get("category").get("categoryId"), categoryId));
            }

            return predicates;
        };
    }

}
