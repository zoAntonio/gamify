package com.gamify.application.services;

import com.gamify.application.dtos.notification.NotificationPreferencesResponse;
import com.gamify.application.dtos.notification.UpdateNotificationPreferencesRequest;
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

/** G1-T12 : lecture/écriture des 3 interrupteurs de notification sur {@link UserProfile}. */
@ExtendWith(MockitoExtension.class)
class NotificationPreferencesServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private UserProfileRepository userProfileRepository;

    @InjectMocks
    private NotificationPreferencesService sut;

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
    void getPreferences_profilExistant_retourneLesTroisInterrupteursActifsParDefaut() {
        NotificationPreferencesResponse result = sut.getPreferences(user.getEmail());

        assertThat(result.rappelActif()).isTrue();
        assertThat(result.finJourneeActif()).isTrue();
        assertThat(result.celebrationActif()).isTrue();
    }

    @Test
    void getPreferences_utilisateurInconnu_lanceNotFoundException() {
        when(userRepository.findByEmail("absent@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sut.getPreferences("absent@test.com"))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void updatePreferences_desactivationPartielle_persisteChaqueInterrupteurIndependamment() {
        UpdateNotificationPreferencesRequest request =
                new UpdateNotificationPreferencesRequest(false, true, false);

        NotificationPreferencesResponse result = sut.updatePreferences(user.getEmail(), request);

        assertThat(result.rappelActif()).isFalse();
        assertThat(result.finJourneeActif()).isTrue();
        assertThat(result.celebrationActif()).isFalse();
        assertThat(profile.isNotifRappelActif()).isFalse();
        assertThat(profile.isNotifFinJourneeActif()).isTrue();
        assertThat(profile.isNotifCelebrationActif()).isFalse();
    }
}
