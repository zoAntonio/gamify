package com.gamify.domain.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Identité/credentials uniquement (username, email, password hashé, rôle) —
 * les données de jeu (attributs, xp, niveau, avatar...) vivent dans
 * {@link UserProfile}, relation 1-1 à clé partagée (@MapsId), pour que la
 * table qui porte le mot de passe hashé ne soit plus requêtée/modifiée à
 * chaque gain de point (V15/V16).
 */
@Entity
@Table(name = "users")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class User extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    // Rôle admin (V16) : un seul admin en pratique, initialisé à l'inscription
    // par correspondance avec gamify.admin.email (voir AuthService), jamais
    // recalculé ensuite — pas encore de mécanisme de promotion dédié.
    @Column(name = "is_admin", nullable = false)
    private boolean admin = false;
}
