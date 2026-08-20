package com.gamify.application.services;

import com.gamify.application.dtos.habit.HabitRequest;
import com.gamify.domain.entities.Domaine;
import com.gamify.domain.entities.Habit;
import com.gamify.domain.entities.HabitCompletion;
import com.gamify.domain.entities.User;
import com.gamify.domain.entities.UserProfile;
import com.gamify.domain.enums.Attribut;
import com.gamify.domain.exceptions.ConflictException;
import com.gamify.domain.exceptions.DomainException;
import com.gamify.domain.exceptions.ForbiddenException;
import com.gamify.domain.exceptions.NotFoundException;
import com.gamify.infrastructure.persistence.DomaineRepository;
import com.gamify.infrastructure.persistence.HabitCompletionRepository;
import com.gamify.infrastructure.persistence.HabitRepository;
import com.gamify.infrastructure.persistence.ProgressionLogRepository;
import com.gamify.infrastructure.persistence.UserProfileRepository;
import com.gamify.infrastructure.persistence.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Ticket dette technique (tests automatisés) : calcul de streak de {@link HabitService},
 * en particulier le recalcul de {@code meilleurStreak} après annulation d'une complétion
 * (identifié comme le candidat le plus sensible dans roadmap.md — "Écarts/dette
 * introduits par l'annulation de complétion G1-T11").
 */
@ExtendWith(MockitoExtension.class)
class HabitServiceTest {

    @Mock
    private HabitRepository habitRepository;
    @Mock
    private HabitCompletionRepository completionRepository;
    @Mock
    private DomaineRepository domaineRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private UserProfileRepository userProfileRepository;
    @Mock
    private ProgressionLogRepository progressionLogRepository;
    @Mock
    private BadgeService badgeService;

    @InjectMocks
    private HabitService sut;

    private User user;
    private UserProfile profile;
    private Habit habit;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("user@test.com");

        profile = new UserProfile();
        profile.setUser(user);
        profile.setId(1L);

        habit = new Habit();
        habit.setId(10L);
        habit.setUser(user);
        habit.setNom("Pompes");
        habit.setAttributCible(Attribut.FOR);
        habit.setXpRecompense(10);
        habit.setMeilleurStreak(0);

        lenient().when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        lenient().when(habitRepository.findById(habit.getId())).thenReturn(Optional.of(habit));
        lenient().when(userProfileRepository.findById(user.getId())).thenReturn(Optional.of(profile));
    }

    private HabitCompletion completionOn(LocalDate date) {
        HabitCompletion completion = new HabitCompletion();
        completion.setHabit(habit);
        completion.setDateCompletion(date);
        return completion;
    }

    @Test
    void checkDate_premiereCompletion_streakDeUnEtGainAppliques() {
        LocalDate today = LocalDate.now();
        when(completionRepository.existsByHabitIdAndDateCompletionAndAnnuleFalse(habit.getId(), today))
                .thenReturn(false);
        when(completionRepository.findByHabitIdAndDateCompletionGreaterThanEqualAndAnnuleFalseOrderByDateCompletionDesc(
                eq(habit.getId()), any()))
                .thenReturn(List.of(completionOn(today)));

        var response = sut.checkDate(user.getEmail(), habit.getId(), today);

        assertThat(response.streakCourant()).isEqualTo(1);
        assertThat(response.faitAujourdhui()).isTrue();
        assertThat(profile.getXpTotal()).isEqualTo(10);
        assertThat(profile.getForce()).isEqualTo(11);
        assertThat(habit.getMeilleurStreak()).isEqualTo(1);
        verify(badgeService).evaluateAndUnlock(user, habit.getDomaine());
    }

    @Test
    void checkDate_septiemeJourDeSuite_bonusDixXpAppliqueEnPlusDuGain() {
        LocalDate today = LocalDate.now();
        List<HabitCompletion> septJours = java.util.stream.IntStream.rangeClosed(0, 6)
                .mapToObj(offset -> completionOn(today.minusDays(offset)))
                .toList();

        when(completionRepository.existsByHabitIdAndDateCompletionAndAnnuleFalse(habit.getId(), today))
                .thenReturn(false);
        when(completionRepository.findByHabitIdAndDateCompletionGreaterThanEqualAndAnnuleFalseOrderByDateCompletionDesc(
                eq(habit.getId()), any()))
                .thenReturn(septJours);

        var response = sut.checkDate(user.getEmail(), habit.getId(), today);

        assertThat(response.streakCourant()).isEqualTo(7);
        // +10 (gain habitude) + 10 (bonus série 7 jours, domain.md)
        assertThat(profile.getXpTotal()).isEqualTo(20);
        assertThat(habit.getMeilleurStreak()).isEqualTo(7);
    }

    @Test
    void checkDate_dejaCocheeCeJour_leveConflictException() {
        LocalDate today = LocalDate.now();
        when(completionRepository.existsByHabitIdAndDateCompletionAndAnnuleFalse(habit.getId(), today))
                .thenReturn(true);

        assertThatThrownBy(() -> sut.checkDate(user.getEmail(), habit.getId(), today))
                .isInstanceOf(ConflictException.class);
        assertThat(profile.getXpTotal()).isZero();
    }

    @Test
    void checkDate_dateFuture_leveDomainException() {
        LocalDate demain = LocalDate.now().plusDays(1);

        assertThatThrownBy(() -> sut.checkDate(user.getEmail(), habit.getId(), demain))
                .isInstanceOf(DomainException.class);
    }

    @Test
    void checkDate_habitudeAppartientAUnAutreUtilisateur_leveForbiddenException() {
        User autreUser = new User();
        autreUser.setId(2L);
        habit.setUser(autreUser);
        LocalDate today = LocalDate.now();

        assertThatThrownBy(() -> sut.checkDate(user.getEmail(), habit.getId(), today))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void annuler_completionActive_repriseSymetriqueEtMeilleurStreakRecalculeSurHistoriqueRestant() {
        LocalDate today = LocalDate.now();
        profile.setForce(11);
        profile.ajouterXp(10);
        habit.setMeilleurStreak(5);

        HabitCompletion completion = completionOn(today);
        when(completionRepository.findByHabitIdAndDateCompletionAndAnnuleFalse(habit.getId(), today))
                .thenReturn(Optional.of(completion));
        // Historique restant après annulation : deux jours non consécutifs → la plus
        // longue suite consécutive tombe à 1 (pas 5, le record doit refléter la réalité).
        when(completionRepository.findByHabitIdAndAnnuleFalseOrderByDateCompletionAsc(habit.getId()))
                .thenReturn(List.of(completionOn(today.minusDays(10)), completionOn(today.minusDays(5))));

        var response = sut.annuler(user.getEmail(), habit.getId(), today);

        assertThat(completion.isAnnule()).isTrue();
        assertThat(profile.getXpTotal()).isZero();
        assertThat(profile.getForce()).isEqualTo(10);
        assertThat(habit.getMeilleurStreak()).isEqualTo(1);
        assertThat(response).isNotNull();
    }

    @Test
    void annuler_meilleurStreakRecalculeSurSuiteConsecutiveReellementLaPlusLongue() {
        LocalDate today = LocalDate.now();
        HabitCompletion completion = completionOn(today);
        when(completionRepository.findByHabitIdAndDateCompletionAndAnnuleFalse(habit.getId(), today))
                .thenReturn(Optional.of(completion));
        // 3 jours consécutifs restants (J-4, J-3, J-2) : le record doit devenir 3.
        when(completionRepository.findByHabitIdAndAnnuleFalseOrderByDateCompletionAsc(habit.getId()))
                .thenReturn(List.of(
                        completionOn(today.minusDays(4)),
                        completionOn(today.minusDays(3)),
                        completionOn(today.minusDays(2))));

        sut.annuler(user.getEmail(), habit.getId(), today);

        assertThat(habit.getMeilleurStreak()).isEqualTo(3);
    }

    @Test
    void annuler_avecBonusAppliqueSurCetteCompletion_reprendAussiLeBonusXp() {
        LocalDate today = LocalDate.now();
        profile.ajouterXp(20); // 10 (gain) + 10 (bonus série déjà appliqué)
        HabitCompletion completion = completionOn(today);
        completion.setBonusApplique(true);
        when(completionRepository.findByHabitIdAndDateCompletionAndAnnuleFalse(habit.getId(), today))
                .thenReturn(Optional.of(completion));
        when(completionRepository.findByHabitIdAndAnnuleFalseOrderByDateCompletionAsc(habit.getId()))
                .thenReturn(List.of());

        sut.annuler(user.getEmail(), habit.getId(), today);

        assertThat(profile.getXpTotal()).isZero();
        assertThat(habit.getMeilleurStreak()).isZero();
    }

    @Test
    void annuler_dateJamaisCochee_leveNotFoundException() {
        LocalDate today = LocalDate.now();
        when(completionRepository.findByHabitIdAndDateCompletionAndAnnuleFalse(habit.getId(), today))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> sut.annuler(user.getEmail(), habit.getId(), today))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void update_donneesValides_modifieLesChampsEtRetourneHabitude() {
        Domaine domaine = new Domaine();
        domaine.setId(5L);
        domaine.setNom("Sport");
        domaine.setAttributs(Set.of(Attribut.VIT));
        when(domaineRepository.findById(5L)).thenReturn(Optional.of(domaine));
        when(completionRepository.findByHabitIdAndDateCompletionGreaterThanEqualAndAnnuleFalseOrderByDateCompletionDesc(
                eq(habit.getId()), any()))
                .thenReturn(List.of());
        HabitRequest request = new HabitRequest("Course", 5L, Attribut.VIT, "🏃", "#3b9dff");

        var response = sut.update(user.getEmail(), habit.getId(), request);

        assertThat(response.nom()).isEqualTo("Course");
        assertThat(response.attributCible()).isEqualTo(Attribut.VIT);
        assertThat(habit.getDomaine()).isEqualTo(domaine);
        assertThat(habit.getIcone()).isEqualTo("🏃");
        verify(habitRepository).save(habit);
    }

    @Test
    void update_attributNAppartientPasAuDomaine_leveDomainException() {
        Domaine domaine = new Domaine();
        domaine.setId(5L);
        domaine.setAttributs(Set.of(Attribut.INT));
        when(domaineRepository.findById(5L)).thenReturn(Optional.of(domaine));
        HabitRequest request = new HabitRequest("Course", 5L, Attribut.VIT, null, null);

        assertThatThrownBy(() -> sut.update(user.getEmail(), habit.getId(), request))
                .isInstanceOf(DomainException.class);
    }

    @Test
    void update_habitudeAppartientAUnAutreUtilisateur_leveForbiddenException() {
        User autreUser = new User();
        autreUser.setId(2L);
        habit.setUser(autreUser);
        HabitRequest request = new HabitRequest("Course", 5L, Attribut.VIT, null, null);

        assertThatThrownBy(() -> sut.update(user.getEmail(), habit.getId(), request))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void delete_habitudePropre_passeActifAFauxSansToucherAuxCompletions() {
        sut.delete(user.getEmail(), habit.getId());

        assertThat(habit.isActif()).isFalse();
        verify(habitRepository).save(habit);
    }

    @Test
    void delete_habitudeAutreUtilisateur_leveForbiddenException() {
        User autreUser = new User();
        autreUser.setId(2L);
        habit.setUser(autreUser);

        assertThatThrownBy(() -> sut.delete(user.getEmail(), habit.getId()))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void checkDate_habitudeDejaSupprimee_leveNotFoundException() {
        habit.setActif(false);
        LocalDate today = LocalDate.now();

        assertThatThrownBy(() -> sut.checkDate(user.getEmail(), habit.getId(), today))
                .isInstanceOf(NotFoundException.class);
    }
}
