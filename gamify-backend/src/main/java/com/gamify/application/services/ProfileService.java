package com.gamify.application.services;

import com.gamify.application.dtos.profile.DomaineResponse;
import com.gamify.application.dtos.profile.ProfileResponse;
import com.gamify.application.dtos.profile.UpdateProfileRequest;
import com.gamify.domain.entities.Domaine;
import com.gamify.domain.entities.User;
import com.gamify.domain.entities.UserProfile;
import com.gamify.domain.enums.Attribut;
import com.gamify.domain.exceptions.DomainException;
import com.gamify.domain.exceptions.NotFoundException;
import com.gamify.infrastructure.persistence.DomaineRepository;
import com.gamify.infrastructure.persistence.UserProfileRepository;
import com.gamify.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.EnumMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileService {

    private static final int AVATAR_MAX_SIZE = 512;

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final DomaineRepository domaineRepository;
    private final ImageProcessingService imageProcessingService;

    @Value("${gamify.uploads.dir}")
    private String uploadsDir;

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(String email) {
        User user = findUserByEmail(email);
        UserProfile profile = findProfile(user);
        return toProfileResponse(user, profile);
    }

    @Transactional
    public ProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = findUserByEmail(email);
        UserProfile profile = findProfile(user);

        List<Domaine> domaines = domaineRepository.findAllById(request.domaineIds());
        if (domaines.size() != request.domaineIds().size()) {
            throw new DomainException("Un ou plusieurs domaines sélectionnés sont introuvables");
        }

        profile.setAvatar(request.avatar());
        profile.setDomainesTrackes(new HashSet<>(domaines));
        userProfileRepository.save(profile);

        log.info("Profil mis à jour pour {}", email);
        return toProfileResponse(user, profile);
    }

    @Transactional
    public ProfileResponse updateAvatar(String email, MultipartFile file) {
        User user = findUserByEmail(email);
        UserProfile profile = findProfile(user);

        BufferedImage source = imageProcessingService.readAndValidate(file);

        try {
            BufferedImage resized = imageProcessingService.resize(source, AVATAR_MAX_SIZE);
            Path avatarsDir = Paths.get(uploadsDir, "avatars");
            Files.createDirectories(avatarsDir);
            String fileName = UUID.randomUUID() + ".jpg";
            ImageIO.write(resized, "jpg", avatarsDir.resolve(fileName).toFile());

            deleteOldAvatar(profile);
            profile.setAvatarImage("avatars/" + fileName);
            userProfileRepository.save(profile);

            log.info("Avatar mis à jour pour {} ({}x{} → {}x{})", email,
                    source.getWidth(), source.getHeight(), resized.getWidth(), resized.getHeight());
            return toProfileResponse(user, profile);
        } catch (IOException e) {
            throw new DomainException("Échec de l'enregistrement de l'image");
        }
    }

    private void deleteOldAvatar(UserProfile profile) {
        if (profile.getAvatarImage() == null) return;
        try {
            Files.deleteIfExists(Paths.get(uploadsDir).resolve(profile.getAvatarImage()));
        } catch (IOException e) {
            log.warn("Ancien avatar non supprimé : {}", profile.getAvatarImage());
        }
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));
    }

    private UserProfile findProfile(User user) {
        return userProfileRepository.findById(user.getId())
                .orElseThrow(() -> new NotFoundException("Profil introuvable"));
    }

    private ProfileResponse toProfileResponse(User user, UserProfile profile) {
        Set<Domaine> domaines = profile.getDomainesTrackes();
        List<DomaineResponse> domaineResponses = domaines.stream()
                .map(this::toDomaineResponse)
                .collect(Collectors.toList());

        Map<Attribut, Integer> attributs = new EnumMap<>(Attribut.class);
        for (Attribut attribut : Attribut.values()) {
            attributs.put(attribut, profile.getValeurAttribut(attribut));
        }

        return new ProfileResponse(
                user.getUsername(),
                user.getEmail(),
                profile.getAvatar(),
                profile.getAvatarImage() != null ? "/uploads/" + profile.getAvatarImage() : null,
                domaineResponses,
                profile.getNiveau(),
                profile.getTitre(),
                profile.getXpTotal(),
                UserProfile.seuilXpPourNiveau(profile.getNiveau() + 1),
                attributs
        );
    }

    private DomaineResponse toDomaineResponse(Domaine domaine) {
        return new DomaineResponse(
                domaine.getId(),
                domaine.getNom(),
                domaine.getAttributs(),
                domaine.isSysteme()
        );
    }
}
