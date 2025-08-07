package com.dangphuoctai.GameManage.entity;

import java.util.ArrayList;
import java.util.List;

import org.hibernate.search.engine.backend.types.Sortable;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.GenericField;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.Indexed;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.IndexedEmbedded;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.KeywordField;

import com.dangphuoctai.GameManage.enums.TypeLanguage;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Indexed
@Data
@Entity
@Table(name = "games")
@NoArgsConstructor
@AllArgsConstructor
public class Game {
    @GenericField(sortable = Sortable.YES)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long gameId;

    @KeywordField(name = "keyId", normalizer = "lowercase", sortable = Sortable.YES)
    @Column(nullable = false, unique = true)
    private String keyId;

    @GenericField(sortable = Sortable.YES)
    @Column(nullable = false)
    private TypeLanguage defaultLanguage;

    @IndexedEmbedded(includePaths = { "categoryId" })
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @IndexedEmbedded(includePaths = { "value" })
    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GameName> gameNames = new ArrayList<>();

}
