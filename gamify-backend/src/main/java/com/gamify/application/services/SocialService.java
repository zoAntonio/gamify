package com.gamify.application.services;

import com.gamify.application.dtos.social.ActivityFeedEntryResponse;
import com.gamify.application.dtos.social.RankResponse;
import com.gamify.domain.entities.User;
import com.gamify.domain.entities.UserProfile;
import com.gamify.domain.enums.Attribut;
import com.gamify.infrastructure.persistence.ProgressionLogRepository;
import com.gamify.infrastructure.persistence.UserProfileRepository;
import com.gamify.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Dimension sociale multi-utilisateurs (G2-T17, domain.md "Multi-utilisateurs") :
 * classement général/par attribut et fil d'activité. Lit exclusivement les profils
 * opt-in ({@link UserProfile#isProfilPublic()}) — un profil qui n'a pas activé ce
 * réglage n'apparaît nulle part ici (voir {@link PrivacyPreferencesService} pour le
 * réglage lui-même). Aucune donnée sensible exposée (pas d'email, pas de mot de
 * passe) : seuls username/niveau/xpTotal/valeurs d'attribut/actions de gain, déjà
 * visibles par leur propriétaire dans le reste de l'app.
 */
@Service
@RequiredArgsConstructor
public class SocialService {

    private static final Set<String> CRITERES_TRI_AUTORISES = Set.of("xpTotal", "niveau");

    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;
    private final ProgressionLogRepository progressionLogRepository;

    /**
     * Classement général (tri xpTotal/niveau) si {@code attribut} est {@code null},
     * classement restreint à cet attribut sinon (tri sur sa seule valeur) — un seul
     * point d'entrée pour les deux cas de l'AC, même patron que
     * {@code AdminUserService.ranking} mais filtré aux profils publics.
     */
    @Transactional(readOnly = true)
    public Page<RankResponse> classement(String sortBy, Attribut attribut, Pageable pageable) {
        String champ = attribut != null ? champPour(attribut) : champTriGeneral(sortBy);
        Pageable trie = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(Sort.Direction.DESC, champ));

        Page<UserProfile> page = userProfileRepository.findByProfilPublicTrue(trie);
        Map<Long, String> usernames = usernamesPour(page.getContent());

        int rang = trie.getPageNumber() * trie.getPageSize() + 1;
        List<RankResponse> classement = new ArrayList<>();
        for (UserProfile profile : page.getContent()) {
            Integer valeurAttribut = attribut != null ? profile.getValeurAttribut(attribut) : null;
            classement.add(new RankResponse(
                    profile.getId(), usernames.get(profile.getId()), profile.getNiveau(), profile.getXpTotal(),
                    valeurAttribut, rang++));
        }
        return new PageImpl<>(classement, trie, page.getTotalElements());
    }

    /**
     * Fil d'activité (voir {@code ProgressionLogRepository.findRecentPublicGains} pour
     * le détail du filtrage : gains uniquement, profils publics uniquement).
     */
    @Transactional(readOnly = true)
    public Page<ActivityFeedEntryResponse> filActivite(Pageable pageable) {
        return progressionLogRepository.findRecentPublicGains(pageable)
                .map(entry -> new ActivityFeedEntryResponse(
                        entry.getUser().getUsername(), entry.getSource(), entry.getAttribut(),
                        entry.getDelta(), entry.getDate()));
    }

    private String champTriGeneral(String sortBy) {
        return CRITERES_TRI_AUTORISES.contains(sortBy) ? sortBy : "xpTotal";
    }

    private String champPour(Attribut attribut) {
        return switch (attribut) {
            case INT -> "intelligence";
            case FOR -> "force";
            case VIT -> "vitalite";
            case PRE -> "precision";
            case CHA -> "charisme";
            case RES -> "resistance";
        };
    }

    // Un seul aller supplémentaire pour résoudre les usernames (credentials) plutôt
    // qu'un accès lazy profile.getUser() par ligne (N+1) — même technique que
    // AdminUserService.ranking.
    private Map<Long, String> usernamesPour(List<UserProfile> profiles) {
        List<Long> ids = profiles.stream().map(UserProfile::getId).toList();
        return userRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(User::getId, User::getUsername));
    }
}
