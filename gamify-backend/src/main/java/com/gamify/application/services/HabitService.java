package com.gamify.application.services;

import com.gamify.application.dtos.habit.HabitRequest;
import com.gamify.application.dtos.habit.HabitResponse;
import com.gamify.domain.entities.Domaine;
import com.gamify.domain.entities.Habit;
import com.gamify.domain.entities.HabitCompletion;
import com.gamify.domain.entities.User;
import com.gamify.domain.exceptions.ConflictException;
import com.gamify.domain.exceptions.DomainException;
import com.gamify.domain.exceptions.ForbiddenException;
import com.gamify.domain.exceptions.NotFoundException;
import com.gamify.infrastructure.persistence.DomaineRepository;
import com.gamify.infrastructure.persistence.HabitCompletionRepository;
import com.gamify.infrastructure.persistence.HabitRepository;
import com.gamify.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HabitService {

    private static final int GRID_DAYS = 84; // 12 semaines (domain.md)
    private static final int STREAK_LOOKBACK_DAYS = 366; // au-delà, streak plafonné — record conservé via meilleurStreak
    private static final int STREAK_BONUS_XP = 10; // +10 XP tous les 7 jours de série (domain.md)

    private final HabitRepository habitRepository;
    private final HabitCompletionRepository completionRepository;
    private final DomaineRepository domaineRepository;
    private final UserRepository userRepository;

    @Transactional
    public HabitResponse create(String email, HabitRequest request) {
        User user = findUserByEmail(email);
        Domaine domaine = domaineRepository.findById(request.domaineId())
                .orElseThrow(() -> new NotFoundException("Domaine introuvable"));

        if (!domaine.getAttributs().contains(request.attributCible())) {
            throw new DomainException(
                    "L'attribut ciblé doit faire partie des attributs du domaine sélectionné");
        }

        Habit habit = new Habit();
        habit.setUser(user);
        habit.setNom(request.nom());
        habit.setDomaine(domaine);
        habit.setAttributCible(request.attributCible());
        habit.setIcone(request.icone());
        habit.setCouleur(request.couleur());
        habitRepository.save(habit);

        log.info("Habitude '{}' créée par {}", habit.getNom(), email);
        return toResponse(habit);
    }

    @Transactional(readOnly = true)
    public Page<HabitResponse> list(String email, Pageable pageable) {
        User user = findUserByEmail(email);
        return habitRepository.findByUserId(user.getId(), pageable).map(this::toResponse);
    }

    @Transactional
    public HabitResponse check(String email, Long habitId) {
        User user = findUserByEmail(email);
        Habit habit = findOwnedHabit(habitId, user);
        LocalDate today = LocalDate.now();

        if (completionRepository.existsByHabitIdAndDateCompletion(habitId, today)) {
            throw new ConflictException("Cette habitude est déjà cochée aujourd'hui");
        }

        HabitCompletion completion = new HabitCompletion();
        completion.setHabit(habit);
        completion.setDateCompletion(today);
        completionRepository.save(completion);

        user.appliquerGainAttribut(habit.getAttributCible());
        user.ajouterXp(habit.getXpRecompense());

        int streak = computeCurrentStreak(habitId, today);
        boolean bonus = streak > 0 && streak % 7 == 0;
        if (bonus) {
            user.ajouterXp(STREAK_BONUS_XP);
        }
        if (streak > habit.getMeilleurStreak()) {
            habit.setMeilleurStreak(streak);
            habitRepository.save(habit);
        }
        userRepository.save(user);

        log.info("Habitude '{}' cochée par {} (+1 {}, +{} XP{}, streak {})",
                habit.getNom(), email, habit.getAttributCible(), habit.getXpRecompense(),
                bonus ? " +" + STREAK_BONUS_XP + " bonus série" : "", streak);
        return toResponse(habit);
    }

    private Habit findOwnedHabit(Long habitId, User user) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new NotFoundException("Habitude introuvable"));

        if (!habit.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Cette habitude ne t'appartient pas");
        }

        return habit;
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));
    }

    /**
     * Jours consécutifs se terminant aujourd'hui, ou hier si aujourd'hui n'est pas
     * encore coché (la série n'est cassée qu'une fois le jour écoulé).
     */
    private int computeCurrentStreak(Long habitId, LocalDate today) {
        Set<LocalDate> days = completionRepository
                .findByHabitIdAndDateCompletionGreaterThanEqualOrderByDateCompletionDesc(
                        habitId, today.minusDays(STREAK_LOOKBACK_DAYS))
                .stream()
                .map(HabitCompletion::getDateCompletion)
                .collect(Collectors.toSet());

        LocalDate cursor = days.contains(today) ? today : today.minusDays(1);
        int streak = 0;
        while (days.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    private HabitResponse toResponse(Habit habit) {
        LocalDate today = LocalDate.now();
        List<LocalDate> completions = completionRepository
                .findByHabitIdAndDateCompletionGreaterThanEqualOrderByDateCompletionDesc(
                        habit.getId(), today.minusDays(GRID_DAYS - 1))
                .stream()
                .map(HabitCompletion::getDateCompletion)
                .toList();

        Domaine domaine = habit.getDomaine();
        return new HabitResponse(
                habit.getId(),
                habit.getNom(),
                domaine != null ? domaine.getId() : null,
                domaine != null ? domaine.getNom() : null,
                habit.getAttributCible(),
                habit.getIcone(),
                habit.getCouleur(),
                habit.getXpRecompense(),
                computeCurrentStreak(habit.getId(), today),
                habit.getMeilleurStreak(),
                completions.contains(today),
                completions
        );
    }
}
