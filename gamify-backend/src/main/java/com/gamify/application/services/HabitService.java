package com.gamify.application.services;

import com.gamify.application.dtos.habit.HabitRequest;
import com.gamify.application.dtos.habit.HabitResponse;
import com.gamify.domain.entities.Domaine;
import com.gamify.domain.entities.Habit;
import com.gamify.domain.entities.HabitCompletion;
import com.gamify.domain.entities.ProgressionLog;
import com.gamify.domain.entities.User;
import com.gamify.domain.entities.UserProfile;
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
    private final UserProfileRepository userProfileRepository;
    private final ProgressionLogRepository progressionLogRepository;
    private final BadgeService badgeService;

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
        return checkDate(email, habitId, LocalDate.now());
    }

    /**
     * Coche une date arbitraire (pas seulement aujourd'hui — utilisé par le
     * calendrier mensuel de la modale de détail), le futur restant interdit.
     */
    @Transactional
    public HabitResponse checkDate(String email, Long habitId, LocalDate date) {
        User user = findUserByEmail(email);
        Habit habit = findOwnedHabit(habitId, user);
        UserProfile profile = findProfile(user);

        if (date.isAfter(LocalDate.now())) {
            throw new DomainException("Impossible de cocher une date future");
        }
        if (completionRepository.existsByHabitIdAndDateCompletionAndAnnuleFalse(habitId, date)) {
            throw new ConflictException("Cette habitude est déjà cochée pour cette date");
        }

        HabitCompletion completion = new HabitCompletion();
        completion.setHabit(habit);
        completion.setDateCompletion(date);
        completionRepository.save(completion);

        int xpAvant = profile.getXpTotal();
        profile.appliquerGainAttribut(habit.getAttributCible());
        profile.ajouterXp(habit.getXpRecompense());
        saveProgressionLog(user, profile, xpAvant, 1, habit.getNom(), habit.getAttributCible().name());

        int streak = computeCurrentStreak(habitId, date);
        boolean bonus = streak > 0 && streak % 7 == 0;
        if (bonus) {
            int xpAvantBonus = profile.getXpTotal();
            profile.ajouterXp(STREAK_BONUS_XP);
            saveProgressionLog(user, profile, xpAvantBonus, 0, "Bonus série 7 jours — " + habit.getNom(), null);
        }
        completion.setBonusApplique(bonus);
        completionRepository.save(completion);
        if (streak > habit.getMeilleurStreak()) {
            habit.setMeilleurStreak(streak);
            habitRepository.save(habit);
        }
        userProfileRepository.save(profile);
        badgeService.evaluateAndUnlock(user, habit.getDomaine());

        log.info("Habitude '{}' cochée par {} pour {} (+1 {}, +{} XP{}, streak {})",
                habit.getNom(), email, date, habit.getAttributCible(), habit.getXpRecompense(),
                bonus ? " +" + STREAK_BONUS_XP + " bonus série" : "", streak);
        return toResponse(habit);
    }

    /**
     * Annule une complétion passée (n'importe quel jour, pas seulement aujourd'hui) :
     * annulation logique (la ligne n'est jamais supprimée, domain.md), reprise
     * symétrique de l'XP/attribut gagnés, et recalcul honnête du record de série
     * (peut baisser) à partir de l'historique complet restant.
     */
    @Transactional
    public HabitResponse annuler(String email, Long habitId, LocalDate date) {
        User user = findUserByEmail(email);
        Habit habit = findOwnedHabit(habitId, user);
        UserProfile profile = findProfile(user);

        HabitCompletion completion = completionRepository
                .findByHabitIdAndDateCompletionAndAnnuleFalse(habitId, date)
                .orElseThrow(() -> new NotFoundException("Cette date n'est pas cochée"));

        completion.setAnnule(true);
        completionRepository.save(completion);

        int xpAvant = profile.getXpTotal();
        profile.retirerGainAttribut(habit.getAttributCible());
        profile.retirerXp(habit.getXpRecompense());
        saveProgressionLog(user, profile, xpAvant, -1, "Annulation — " + habit.getNom(), habit.getAttributCible().name());

        if (completion.isBonusApplique()) {
            int xpAvantBonus = profile.getXpTotal();
            profile.retirerXp(STREAK_BONUS_XP);
            saveProgressionLog(user, profile, xpAvantBonus, 0, "Annulation bonus série — " + habit.getNom(), null);
        }
        userProfileRepository.save(profile);

        habit.setMeilleurStreak(computeMeilleurStreakHistorique(habitId));
        habitRepository.save(habit);

        log.info("Complétion du {} annulée pour l'habitude '{}' par {}", date, habit.getNom(), email);
        return toResponse(habit);
    }

    private void saveProgressionLog(User user, UserProfile profile, int xpAvant, int delta, String source, String attribut) {
        ProgressionLog logEntry = new ProgressionLog();
        logEntry.setUser(user);
        logEntry.setXpAvant(xpAvant);
        logEntry.setXpApres(profile.getXpTotal());
        logEntry.setDelta(delta);
        logEntry.setSource(source);
        logEntry.setAttribut(attribut);
        progressionLogRepository.save(logEntry);
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

    private UserProfile findProfile(User user) {
        return userProfileRepository.findById(user.getId())
                .orElseThrow(() -> new NotFoundException("Profil introuvable"));
    }

    /**
     * Jours consécutifs se terminant aujourd'hui, ou hier si aujourd'hui n'est pas
     * encore coché (la série n'est cassée qu'une fois le jour écoulé).
     */
    private int computeCurrentStreak(Long habitId, LocalDate today) {
        Set<LocalDate> days = completionRepository
                .findByHabitIdAndDateCompletionGreaterThanEqualAndAnnuleFalseOrderByDateCompletionDesc(
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

    /**
     * Plus longue série consécutive de jours dans tout l'historique actif
     * (contrairement à {@link #computeCurrentStreak}, ne se limite pas à une
     * série se terminant aujourd'hui) — utilisé pour recalculer honnêtement
     * meilleurStreak après annulation d'une complétion.
     */
    private int computeMeilleurStreakHistorique(Long habitId) {
        List<LocalDate> days = completionRepository
                .findByHabitIdAndAnnuleFalseOrderByDateCompletionAsc(habitId)
                .stream()
                .map(HabitCompletion::getDateCompletion)
                .toList();

        int meilleur = 0;
        int courant = 0;
        LocalDate precedent = null;
        for (LocalDate jour : days) {
            courant = (precedent != null && jour.equals(precedent.plusDays(1))) ? courant + 1 : 1;
            meilleur = Math.max(meilleur, courant);
            precedent = jour;
        }
        return meilleur;
    }

    private HabitResponse toResponse(Habit habit) {
        LocalDate today = LocalDate.now();
        List<LocalDate> completions = completionRepository
                .findByHabitIdAndDateCompletionGreaterThanEqualAndAnnuleFalseOrderByDateCompletionDesc(
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
