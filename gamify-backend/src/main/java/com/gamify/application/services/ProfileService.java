package com.gamify.application.services;

import com.gamify.application.dtos.profile.DomaineResponse;
import com.gamify.application.dtos.profile.ProfileResponse;
import com.gamify.application.dtos.profile.UpdateProfileRequest;
import com.gamify.domain.entities.Domaine;
import com.gamify.domain.entities.User;
import com.gamify.domain.enums.Attribut;
import com.gamify.domain.exceptions.DomainException;
import com.gamify.domain.exceptions.NotFoundException;
import com.gamify.infrastructure.persistence.DomaineRepository;
import com.gamify.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
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
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("image/png", "image/jpeg");

    private final UserRepository userRepository;
    private final DomaineRepository domaineRepository;

    @Value("${gamify.uploads.dir}")
    private String uploadsDir;

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(String email) {
        User user = findUserByEmail(email);
        return toProfileResponse(user);
    }

    @Transactional
    public ProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = findUserByEmail(email);

        List<Domaine> domaines = domaineRepository.findAllById(request.domaineIds());
        if (domaines.size() != request.domaineIds().size()) {
            throw new DomainException("Un ou plusieurs domaines sélectionnés sont introuvables");
        }

        user.setAvatar(request.avatar());
        user.setDomainesTrackes(new HashSet<>(domaines));
        userRepository.save(user);

        log.info("Profil mis à jour pour {}", email);
        return toProfileResponse(user);
    }

    @Transactional
    public ProfileResponse updateAvatar(String email, MultipartFile file) {
        User user = findUserByEmail(email);

        if (file == null || file.isEmpty()) {
            throw new DomainException("Aucun fichier reçu");
        }
        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new DomainException("Format non supporté — utilise une image PNG ou JPEG");
        }

        try {
            BufferedImage source = ImageIO.read(file.getInputStream());
            if (source == null) {
                throw new DomainException("Image illisible ou corrompue");
            }

            BufferedImage resized = resize(source);
            Path avatarsDir = Paths.get(uploadsDir, "avatars");
            Files.createDirectories(avatarsDir);
            String fileName = UUID.randomUUID() + ".jpg";
            ImageIO.write(resized, "jpg", avatarsDir.resolve(fileName).toFile());

            deleteOldAvatar(user);
            user.setAvatarImage("avatars/" + fileName);
            userRepository.save(user);

            log.info("Avatar mis à jour pour {} ({}x{} → {}x{})", email,
                    source.getWidth(), source.getHeight(), resized.getWidth(), resized.getHeight());
            return toProfileResponse(user);
        } catch (IOException e) {
            throw new DomainException("Échec de l'enregistrement de l'image");
        }
    }

    /** Redimensionne en conservant le ratio, borné à 512px, fond sombre (transparence PNG → JPEG). */
    private BufferedImage resize(BufferedImage source) {
        double scale = Math.min(1.0,
                (double) AVATAR_MAX_SIZE / Math.max(source.getWidth(), source.getHeight()));
        int width = Math.max(1, (int) Math.round(source.getWidth() * scale));
        int height = Math.max(1, (int) Math.round(source.getHeight() * scale));

        BufferedImage target = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = target.createGraphics();
        graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION,
                RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        graphics.setColor(new Color(5, 6, 15)); // Midnight Canvas du thème
        graphics.fillRect(0, 0, width, height);
        graphics.drawImage(source, 0, 0, width, height, null);
        graphics.dispose();
        return target;
    }

    private void deleteOldAvatar(User user) {
        if (user.getAvatarImage() == null) return;
        try {
            Files.deleteIfExists(Paths.get(uploadsDir).resolve(user.getAvatarImage()));
        } catch (IOException e) {
            log.warn("Ancien avatar non supprimé : {}", user.getAvatarImage());
        }
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));
    }

    private ProfileResponse toProfileResponse(User user) {
        Set<Domaine> domaines = user.getDomainesTrackes();
        List<DomaineResponse> domaineResponses = domaines.stream()
                .map(this::toDomaineResponse)
                .collect(Collectors.toList());

        Map<Attribut, Integer> attributs = new EnumMap<>(Attribut.class);
        for (Attribut attribut : Attribut.values()) {
            attributs.put(attribut, user.getValeurAttribut(attribut));
        }

        return new ProfileResponse(
                user.getUsername(),
                user.getEmail(),
                user.getAvatar(),
                user.getAvatarImage() != null ? "/uploads/" + user.getAvatarImage() : null,
                domaineResponses,
                user.getNiveau(),
                user.getTitre(),
                user.getXpTotal(),
                User.seuilXpPourNiveau(user.getNiveau() + 1),
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
