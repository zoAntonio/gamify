package com.gamify.application.services;

import com.gamify.application.dtos.backoffice.CreateSaisonRequest;
import com.gamify.application.dtos.backoffice.SaisonResponse;
import com.gamify.domain.entities.Saison;
import com.gamify.domain.exceptions.ConflictException;
import com.gamify.domain.exceptions.DomainException;
import com.gamify.domain.exceptions.NotFoundException;
import com.gamify.infrastructure.persistence.SaisonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Gestion admin des saisons du système d'achievement. Pas de suppression : une
 * saison clôturée reste en base pour l'historique des badges qui y sont rattachés
 * (UserBadge.saison).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SaisonService {

    private final SaisonRepository saisonRepository;

    @Transactional(readOnly = true)
    public Page<SaisonResponse> list(Pageable pageable) {
        return saisonRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional
    public SaisonResponse create(CreateSaisonRequest request) {
        if (!request.dateFin().isAfter(request.dateDebut())) {
            throw new DomainException("La date de fin de la saison doit être après sa date de début");
        }
        if (saisonRepository.findByClotureeFalse().isPresent()) {
            throw new ConflictException("Une saison est déjà active, clôturez-la avant d'en ouvrir une nouvelle");
        }

        Saison saison = new Saison();
        saison.setNom(request.nom());
        saison.setDateDebut(request.dateDebut());
        saison.setDateFin(request.dateFin());
        saisonRepository.save(saison);

        log.info("Saison '{}' créée ({} → {})", saison.getNom(), saison.getDateDebut(), saison.getDateFin());
        return toResponse(saison);
    }

    @Transactional
    public SaisonResponse cloturer(Long id) {
        Saison saison = saisonRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Saison introuvable"));
        if (saison.isCloturee()) {
            throw new ConflictException("Cette saison est déjà clôturée");
        }

        saison.setCloturee(true);
        log.info("Saison '{}' clôturée", saison.getNom());
        return toResponse(saison);
    }

    private SaisonResponse toResponse(Saison saison) {
        return new SaisonResponse(
                saison.getId(),
                saison.getNom(),
                saison.getDateDebut(),
                saison.getDateFin(),
                saison.isCloturee()
        );
    }
}
