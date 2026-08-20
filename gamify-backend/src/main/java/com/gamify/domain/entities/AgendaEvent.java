package com.gamify.domain.entities;

import com.gamify.domain.enums.Frequence;
import jakarta.persistence.Column;
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

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "agenda_events")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class AgendaEvent extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String titre;

    @Column(name = "date_debut", nullable = false)
    private LocalDateTime dateDebut;

    @Column(name = "date_fin", nullable = false)
    private LocalDateTime dateFin;

    // Lien optionnel vers une tâche kanban : l'agenda colore l'événement selon
    // le statut de la tâche (vert TERMINE / rouge manqué).
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activity_id")
    private Activity activity;

    // Récurrence (G1-T10, partie restante) : occurrences matérialisées, une ligne
    // par occurrence, regroupées par serieId. Volontairement pas une FK — voir
    // AgendaService pour le détail du choix (auto-référence cassante en cas de
    // suppression d'une occurrence seule).
    @Column(name = "serie_id")
    private Long serieId;

    @Enumerated(EnumType.STRING)
    @Column(name = "frequence_recurrence", length = 20)
    private Frequence frequenceRecurrence;

    // CSV de java.time.DayOfWeek (ex. "MONDAY,WEDNESDAY"), pertinent seulement si
    // frequenceRecurrence == HEBDOMADAIRE. Jamais interrogé en SQL, conversion
    // en liste faite côté AgendaService — pas de table séparée pour ça.
    @Column(name = "jours_semaine", length = 100)
    private String joursSemaine;

    @Column(name = "fin_recurrence")
    private LocalDate finRecurrence;

    // true dès que cette occurrence a été éditée individuellement : exclut la
    // ligne des opérations "toute la série" (update/regénération) suivantes.
    @Column(nullable = false)
    private boolean detachee = false;
}
