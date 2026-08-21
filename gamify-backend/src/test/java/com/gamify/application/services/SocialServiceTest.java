package com.gamify.application.services;

import com.gamify.application.dtos.social.ActivityFeedEntryResponse;
import com.gamify.application.dtos.social.RankResponse;
import com.gamify.domain.entities.ProgressionLog;
import com.gamify.domain.entities.User;
import com.gamify.domain.entities.UserProfile;
import com.gamify.domain.enums.Attribut;
import com.gamify.infrastructure.persistence.ProgressionLogRepository;
import com.gamify.infrastructure.persistence.UserProfileRepository;
import com.gamify.infrastructure.persistence.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * G2-T17 : le comportement le plus sensible à vérifier ici est le filtrage par
 * profil opt-in ({@code findByProfilPublicTrue}/{@code findRecentPublicGains}) —
 * un profil non public ne doit jamais atteindre ces méthodes de service.
 */
@ExtendWith(MockitoExtension.class)
class SocialServiceTest {

    @Mock
    private UserProfileRepository userProfileRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ProgressionLogRepository progressionLogRepository;

    @InjectMocks
    private SocialService sut;

    private UserProfile profilPublic(long id, String username, int niveau, int xpTotal) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);

        UserProfile profile = new UserProfile();
        profile.setId(id);
        profile.setUser(user);
        profile.setNiveau(niveau);
        profile.setXpTotal(xpTotal);
        profile.setProfilPublic(true);
        return profile;
    }

    @Test
    void classement_sansAttribut_interrogeSeulementLesProfilsPublicsTriesParXpTotal() {
        UserProfile profile = profilPublic(1L, "demo", 3, 250);
        when(userProfileRepository.findByProfilPublicTrue(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(profile)));
        when(userRepository.findAllById(List.of(1L))).thenReturn(List.of(profile.getUser()));

        Page<RankResponse> result = sut.classement("xpTotal", null, PageRequest.of(0, 20));

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(userProfileRepository).findByProfilPublicTrue(captor.capture());
        assertThat(captor.getValue().getSort()).isEqualTo(Sort.by(Sort.Direction.DESC, "xpTotal"));

        assertThat(result.getContent()).hasSize(1);
        RankResponse rank = result.getContent().get(0);
        assertThat(rank.username()).isEqualTo("demo");
        assertThat(rank.xpTotal()).isEqualTo(250);
        assertThat(rank.valeurAttribut()).isNull();
        assertThat(rank.rang()).isEqualTo(1);
    }

    @Test
    void classement_sortByInconnu_retombeSurXpTotal() {
        when(userProfileRepository.findByProfilPublicTrue(any(Pageable.class))).thenReturn(new PageImpl<>(List.of()));

        sut.classement("mot-de-passe", null, PageRequest.of(0, 20));

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(userProfileRepository).findByProfilPublicTrue(captor.capture());
        assertThat(captor.getValue().getSort()).isEqualTo(Sort.by(Sort.Direction.DESC, "xpTotal"));
    }

    @Test
    void classement_avecAttribut_trieSurLeChampDeLAttributEtRenseigneSaValeur() {
        UserProfile profile = profilPublic(1L, "demo", 2, 100);
        profile.setForce(14);
        when(userProfileRepository.findByProfilPublicTrue(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(profile)));
        when(userRepository.findAllById(List.of(1L))).thenReturn(List.of(profile.getUser()));

        Page<RankResponse> result = sut.classement("xpTotal", Attribut.FOR, PageRequest.of(0, 20));

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(userProfileRepository).findByProfilPublicTrue(captor.capture());
        assertThat(captor.getValue().getSort()).isEqualTo(Sort.by(Sort.Direction.DESC, "force"));
        assertThat(result.getContent().get(0).valeurAttribut()).isEqualTo(14);
    }

    @Test
    void filActivite_mappeUsernameSourceAttributEtDeltaDepuisLeLog() {
        User user = new User();
        user.setId(2L);
        user.setUsername("public_user");

        ProgressionLog log = new ProgressionLog();
        log.setUser(user);
        log.setSource("Exo maths");
        log.setAttribut("INT");
        log.setDelta(1);
        log.setDate(LocalDateTime.now());

        when(progressionLogRepository.findRecentPublicGains(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(log)));

        Page<ActivityFeedEntryResponse> result = sut.filActivite(PageRequest.of(0, 20));

        assertThat(result.getContent()).hasSize(1);
        ActivityFeedEntryResponse entry = result.getContent().get(0);
        assertThat(entry.username()).isEqualTo("public_user");
        assertThat(entry.source()).isEqualTo("Exo maths");
        assertThat(entry.attribut()).isEqualTo("INT");
        assertThat(entry.delta()).isEqualTo(1);
    }
}
