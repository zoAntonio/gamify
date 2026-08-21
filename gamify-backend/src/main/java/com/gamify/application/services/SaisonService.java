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
 * (UserBadge.saison). Au plus une saison active à la fois : {@link #create} clôture
 * automatiquement la saison active existante avant d'ouvrir la nouvelle.
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

        // Clôture automatique de la saison active existante, s'il y en a une :
        // l'admin n'a pas à clôturer explicitement avant de créer la suivante.
        // saveAndFlush (et non une simple mise à jour laissée au dirty-checking) :
        // avec un id en stratégie IDENTITY, l'INSERT de la nouvelle saison ci-dessous
        // part immédiatement (persist() ne peut pas être différé), alors qu'une
        // UPDATE laissée au flush de fin de transaction partirait après — les deux
        // lignes se retrouveraient un instant à cloturee=false en base et
        // violeraient l'index unique partiel (V11, cloturee=false). Flush explicite
        // pour garantir l'ordre. Ce même index reste le garde-fou en cas de course
        // entre deux requêtes concurrentes.
        saisonRepository.findByClotureeFalse().ifPresent(active -> {
            active.setCloturee(true);
            saisonRepository.saveAndFlush(active);
            log.info("Saison '{}' clôturée automatiquement (nouvelle saison créée)", active.getNom());
        });

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
