package com.gamify.application.services;

import com.gamify.domain.exceptions.DomainException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.Set;

/**
 * Validation/redimensionnement d'image uploadée — extrait de {@link ProfileService}
 * (upload d'avatar, G0-T03) pour être réutilisé tel quel par la photo preuve
 * d'activité (G2-T16) sans dupliquer l'algorithme (règle de convention : duplication
 * > 20 lignes = P0). Aucun état, pas de dépendance au chemin de stockage (chaque
 * appelant reste responsable de nommer/écrire/supprimer son propre fichier, les
 * dossiers cibles diffèrent : avatars/ vs activity-proofs/).
 */
@Slf4j
@Service
public class ImageProcessingService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("image/png", "image/jpeg");

    /** Vérifie présence/format/lisibilité, lève une {@link DomainException} sinon. */
    public BufferedImage readAndValidate(MultipartFile file) {
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
            return source;
        } catch (IOException e) {
            throw new DomainException("Échec de la lecture de l'image");
        }
    }

    /** Redimensionne en conservant le ratio, borné à maxSize px, fond sombre (transparence PNG → JPEG). */
    public BufferedImage resize(BufferedImage source, int maxSize) {
        double scale = Math.min(1.0,
                (double) maxSize / Math.max(source.getWidth(), source.getHeight()));
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
}
