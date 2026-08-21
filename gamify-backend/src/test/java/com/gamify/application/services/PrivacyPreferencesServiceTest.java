package com.gamify.application.services;

import com.gamify.application.dtos.social.PrivacyPreferencesResponse;
import com.gamify.application.dtos.social.UpdatePrivacyPreferencesRequest;
import com.gamify.domain.entities.User;
import com.gamify.domain.entities.UserProfile;
import com.gamify.domain.exceptions.NotFoundException;
import com.gamify.infrastructure.persistence.UserProfileRepository;
import com.gamify.infrastructure.persistence.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

/** G2-T17 : lecture/écriture du réglage de visibilité du profil sur {@link UserProfile}. */
@ExtendWith(MockitoExtension.class)
class PrivacyPreferencesServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private UserProfileRepository userProfileRepository;

    @InjectMocks
    private PrivacyPreferencesService sut;

    private User user;
    private UserProfile profile;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("user@test.com");

        profile = new UserProfile();
        profile.setId(1L);
        profile.setUser(user);

        lenient().when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        lenient().when(userProfileRepository.findById(user.getId())).thenReturn(Optional.of(profile));
    }

    @Test
    void getPreferences_profilExistant_retourneProfilPriveParDefaut() {
        PrivacyPreferencesResponse result = sut.getPreferences(user.getEmail());

        assertThat(result.profilPublic()).isFalse();
    }

    @Test
    void getPreferences_utilisateurInconnu_lanceNotFoundException() {
        when(userRepository.findByEmail("absent@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sut.getPreferences("absent@test.com"))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void updatePreferences_activation_persisteProfilPublicATrue() {
        UpdatePrivacyPreferencesRequest request = new UpdatePrivacyPreferencesRequest(true);

        PrivacyPreferencesResponse result = sut.updatePreferences(user.getEmail(), request);

        assertThat(result.profilPublic()).isTrue();
        assertThat(profile.isProfilPublic()).isTrue();
    }

    @Test
    void updatePreferences_desactivation_persisteProfilPublicAFalse() {
        profile.setProfilPublic(true);
        UpdatePrivacyPreferencesRequest request = new UpdatePrivacyPreferencesRequest(false);

        PrivacyPreferencesResponse result = sut.updatePreferences(user.getEmail(), request);

        assertThat(result.profilPublic()).isFalse();
        assertThat(profile.isProfilPublic()).isFalse();
    }
}
