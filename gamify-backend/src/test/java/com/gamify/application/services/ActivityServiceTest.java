package com.gamify.application.services;

import com.gamify.application.dtos.activity.ActivityResponse;
import com.gamify.domain.entities.Activity;
import com.gamify.domain.entities.Domaine;
import com.gamify.domain.entities.User;
import com.gamify.domain.entities.UserProfile;
import com.gamify.domain.enums.Attribut;
import com.gamify.domain.enums.Frequence;
import com.gamify.domain.enums.StatutKanban;
import com.gamify.domain.exceptions.DomainException;
import com.gamify.infrastructure.persistence.ActivityRepository;
import com.gamify.infrastructure.persistence.DomaineRepository;
import com.gamify.infrastructure.persistence.ProgressionLogRepository;
import com.gamify.infrastructure.persistence.UserProfileRepository;
import com.gamify.infrastructure.persistence.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Ticket G2-T16 (photo preuve à la validation) : bonus d'attribut différencié
 * (+2 au lieu de +1) selon la présence d'une photo, et suppression de la photo
 * après coup. {@link ImageProcessingService} est utilisé tel quel (pas mocké,
 * aucune dépendance externe) pour vérifier le redimensionnement/l'écriture réels
 * sur un répertoire temporaire — voir roadmap.md pour le reste des critères
 * (dette : ActivityService n'avait aucun test avant ce ticket).
 */
@ExtendWith(MockitoExtension.class)
class ActivityServiceTest {

    @Mock
    private ActivityRepository activityRepository;
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

    @TempDir
    private Path tempDir;

    private ActivityService sut;

    private User user;
    private UserProfile profile;
    private Activity activity;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("user@test.com");

        profile = new UserProfile();
        profile.setUser(user);
        profile.setId(1L);

        Domaine domaine = new Domaine();
        domaine.setId(1L);
        domaine.setNom("Sport");

        activity = new Activity();
        activity.setId(10L);
        activity.setUser(user);
        activity.setNom("10 pompes");
        activity.setDomaine(domaine);
        activity.setAttributCible(Attribut.FOR);
        activity.setFrequence(Frequence.QUOTIDIEN);
        activity.setStatut(StatutKanban.EN_COURS);

        // Construction manuelle plutôt que @InjectMocks : ImageProcessingService doit
        // rester une vraie instance (aucune dépendance, comportement réel à vérifier),
        // pas un mock Mockito.
        sut = new ActivityService(
                activityRepository, domaineRepository, userRepository,
                userProfileRepository, progressionLogRepository, badgeService,
                new ImageProcessingService()
        );
        ReflectionTestUtils.setField(sut, "uploadsDir", tempDir.toString());

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(activityRepository.findById(10L)).thenReturn(Optional.of(activity));
        // Pas utilisé par les scénarios d'erreur (exception levée avant d'atteindre le profil).
        lenient().when(userProfileRepository.findById(1L)).thenReturn(Optional.of(profile));
    }

    @Test
    void valider_sansPhoto_appliqueGainDeUnEtAucunePhotoUrl() {
        ActivityResponse response = sut.valider("user@test.com", 10L, null);

        assertThat(profile.getValeurAttribut(Attribut.FOR)).isEqualTo(11); // 10 + 1
        assertThat(response.photoUrl()).isNull();
        assertThat(response.statut()).isEqualTo(StatutKanban.TERMINE);
        verify(progressionLogRepository).save(argThatDelta(1));
    }

    @Test
    void valider_avecPhoto_appliqueGainDeDeuxEtExposeLaPhotoUrl() throws IOException {
        ActivityResponse response = sut.valider("user@test.com", 10L, unePhotoPng());

        assertThat(profile.getValeurAttribut(Attribut.FOR)).isEqualTo(12); // 10 + 2
        assertThat(response.photoUrl()).startsWith("/uploads/activity-proofs/").endsWith(".jpg");
        verify(progressionLogRepository).save(argThatDelta(2));

        // Le fichier redimensionné a réellement été écrit sur le disque temporaire.
        String relatif = response.photoUrl().substring("/uploads/".length());
        assertThat(Files.exists(tempDir.resolve(relatif))).isTrue();
    }

    @Test
    void valider_photoFormatNonSupporte_leveDomainExceptionEtNeValidePasLaTache() {
        MockMultipartFile photoTexte = new MockMultipartFile("photo", "note.txt", "text/plain", "pas une image".getBytes());

        assertThatThrownBy(() -> sut.valider("user@test.com", 10L, photoTexte))
                .isInstanceOf(DomainException.class);

        assertThat(activity.getStatut()).isEqualTo(StatutKanban.EN_COURS);
    }

    @Test
    void valider_tacheDejaTerminee_leveDomainException() {
        activity.setStatut(StatutKanban.TERMINE);

        assertThatThrownBy(() -> sut.valider("user@test.com", 10L, null))
                .isInstanceOf(DomainException.class)
                .hasMessageContaining("déjà validée");
    }

    @Test
    void supprimerPhoto_tacheSansPhoto_leveDomainException() {
        assertThatThrownBy(() -> sut.supprimerPhoto("user@test.com", 10L))
                .isInstanceOf(DomainException.class)
                .hasMessageContaining("pas de photo");
    }

    @Test
    void supprimerPhoto_tacheAvecPhoto_supprimeLeFichierEtReinitialisePhotoPreuve() throws IOException {
        Path proofsDir = tempDir.resolve("activity-proofs");
        Files.createDirectories(proofsDir);
        Path fichier = proofsDir.resolve("existante.jpg");
        Files.write(fichier, new byte[]{1, 2, 3});
        activity.setPhotoPreuve("activity-proofs/existante.jpg");

        ActivityResponse response = sut.supprimerPhoto("user@test.com", 10L);

        assertThat(response.photoUrl()).isNull();
        assertThat(activity.getPhotoPreuve()).isNull();
        assertThat(Files.exists(fichier)).isFalse();
    }

    private MockMultipartFile unePhotoPng() throws IOException {
        BufferedImage image = new BufferedImage(800, 600, BufferedImage.TYPE_INT_RGB);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(image, "png", out);
        return new MockMultipartFile("photo", "preuve.png", "image/png", out.toByteArray());
    }

    private com.gamify.domain.entities.ProgressionLog argThatDelta(int delta) {
        return org.mockito.ArgumentMatchers.argThat(log -> log != null && log.getDelta() == delta);
    }
}
