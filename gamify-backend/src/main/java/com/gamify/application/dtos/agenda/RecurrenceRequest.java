package com.gamify.application.dtos.agenda;

import com.gamify.domain.enums.Frequence;
import jakarta.validation.constraints.NotNull;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

// joursSemaine n'est exploité que si frequence == HEBDOMADAIRE (doit alors être
// non vide — validé en service, pas ici, car la règle dépend d'un autre champ
// du même record).
public record RecurrenceRequest(
        @NotNull(message = "La fréquence de récurrence est obligatoire")
        Frequence frequence,

        List<DayOfWeek> joursSemaine,

        @NotNull(message = "La date de fin de récurrence est obligatoire")
        LocalDate finRecurrence
) {
}
