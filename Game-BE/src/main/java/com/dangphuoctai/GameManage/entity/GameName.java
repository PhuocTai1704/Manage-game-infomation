package com.dangphuoctai.GameManage.entity;

import com.dangphuoctai.GameManage.enums.TypeLanguage;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "game_names", uniqueConstraints = @UniqueConstraint(columnNames = { "game_id", "language" }))
@NoArgsConstructor
@AllArgsConstructor
public class GameName {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long gameNameId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TypeLanguage language;

    @Column(nullable = false)
    private String value;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;
}
