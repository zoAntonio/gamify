package com.gamify.domain.entities;

import com.gamify.domain.enums.Attribut;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "domaines")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class Domaine extends BaseEntity {

    @Column(nullable = false)
    private String nom;

    @ElementCollection
    @CollectionTable(name = "domaine_attributs", joinColumns = @JoinColumn(name = "domaine_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "attribut")
    private Set<Attribut> attributs = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cree_par_user_id")
    private User creePar;

    // Désactivation logique depuis le backoffice (jamais de suppression physique).
    private boolean actif = true;

    public boolean isSysteme() {
        return creePar == null;
    }
}
