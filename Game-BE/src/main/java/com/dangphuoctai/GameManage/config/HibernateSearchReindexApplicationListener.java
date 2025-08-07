package com.dangphuoctai.GameManage.config;

import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.hibernate.search.mapper.orm.Search;
import org.hibernate.search.mapper.orm.session.SearchSession;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class HibernateSearchReindexApplicationListener {

    private final EntityManager entityManager;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void reindex() {
        try {
            SearchSession searchSession = Search.session(entityManager);
            searchSession.massIndexer()
                    .startAndWait();
            System.out.println("✅ Hibernate Search indexing completed.");
        } catch (InterruptedException e) {
            System.err.println("❌ Indexing interrupted: " + e.getMessage());
            Thread.currentThread().interrupt();
        }
    }


}
