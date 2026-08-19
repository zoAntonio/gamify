package com.gamify.application.services;

import com.gamify.application.dtos.backoffice.BadgeDefinitionRequest;
import com.gamify.application.dtos.backoffice.BadgeDefinitionResponse;
import com.gamify.domain.entities.BadgeDefinition;
import com.gamify.domain.entities.Domaine;
import com.gamify.domain.exceptions.NotFoundException;
import com.gamify.infrastructure.persistence.BadgeDefinitionRepository;
import com.gamify.infrastructure.persistence.DomaineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** CRUD admin du catalogue de badges (Bronze/Argent/Or par domaine, domain.md). */
@Slf4j
@Service
@RequiredArgsConstructor
public class BadgeDefinitionService {

    private final BadgeDefinitionRepository badgeDefinitionRepository;
    private final DomaineRepository domaineRepository;

    @Transactional(readOnly = true)
    public Page<BadgeDefinitionResponse> list(Long domaineId, Pageable pageable) {
        Page<BadgeDefinition> page = domaineId != null
                ? badgeDefinitionRepository.findByDomaineId(domaineId, pageable)
                : badgeDefinitionRepository.findAll(pageable);
        return page.map(this::toResponse);
    }

    @Transactional
    public BadgeDefinitionResponse create(BadgeDefinitionRequest request) {
        Domaine domaine = findDomaine(request.domaineId());

        BadgeDefinition badge = new BadgeDefinition();
        badge.setDomaine(domaine);
        applyRequest(badge, request);
        badgeDefinitionRepository.save(badge);

        log.info("Badge '{}' ({}) créé pour le domaine '{}'", badge.getNom(), badge.getPalier(), domaine.getNom());
        return toResponse(badge);
    }

    @Transactional
    public BadgeDefinitionResponse update(Long id, BadgeDefinitionRequest request) {
        BadgeDefinition badge = findById(id);
        badge.setDomaine(findDomaine(request.domaineId()));
        applyRequest(badge, request);

        log.info("Badge '{}' modifié", badge.getNom());
        return toResponse(badge);
    }

    @Transactional
    public BadgeDefinitionResponse deactivate(Long id) {
        BadgeDefinition badge = findById(id);
        badge.setActif(false);

        log.info("Badge '{}' désactivé", badge.getNom());
        return toResponse(badge);
    }

    private void applyRequest(BadgeDefinition badge, BadgeDefinitionRequest request) {
        badge.setPalier(request.palier());
        badge.setNom(request.nom());
        badge.setDescription(request.description());
        badge.setSeuilValidations(request.seuilValidations());
    }

    private BadgeDefinition findById(Long id) {
        return badgeDefinitionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Badge introuvable"));
    }

    private Domaine findDomaine(Long domaineId) {
        return domaineRepository.findById(domaineId)
                .orElseThrow(() -> new NotFoundException("Domaine introuvable"));
    }

    private BadgeDefinitionResponse toResponse(BadgeDefinition badge) {
        return new BadgeDefinitionResponse(
                badge.getId(),
                badge.getDomaine().getId(),
                badge.getDomaine().getNom(),
                badge.getPalier(),
                badge.getNom(),
                badge.getDescription(),
                badge.getSeuilValidations(),
                badge.isActif()
        );
    }
}
