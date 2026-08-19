package com.gamify.application.services;

import com.gamify.application.dtos.backoffice.AdminDomaineResponse;
import com.gamify.application.dtos.profile.CreateDomaineRequest;
import com.gamify.domain.entities.Domaine;
import com.gamify.domain.exceptions.NotFoundException;
import com.gamify.infrastructure.persistence.DomaineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * CRUD backoffice sur tous les domaines (système ET personnels des utilisateurs) —
 * sémantique distincte de {@link DomaineService} (joueur, scope "mes domaines").
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminDomaineService {

    private final DomaineRepository domaineRepository;

    @Transactional(readOnly = true)
    public Page<AdminDomaineResponse> list(Pageable pageable) {
        return domaineRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional
    public AdminDomaineResponse create(CreateDomaineRequest request) {
        Domaine domaine = new Domaine();
        domaine.setNom(request.nom());
        domaine.setAttributs(request.attributs());
        domaineRepository.save(domaine);

        log.info("Domaine système '{}' créé depuis le backoffice", domaine.getNom());
        return toResponse(domaine);
    }

    @Transactional
    public AdminDomaineResponse update(Long id, CreateDomaineRequest request) {
        Domaine domaine = findById(id);
        domaine.setNom(request.nom());
        domaine.setAttributs(request.attributs());

        log.info("Domaine '{}' modifié depuis le backoffice", domaine.getNom());
        return toResponse(domaine);
    }

    @Transactional
    public AdminDomaineResponse deactivate(Long id) {
        Domaine domaine = findById(id);
        domaine.setActif(false);

        log.info("Domaine '{}' désactivé depuis le backoffice", domaine.getNom());
        return toResponse(domaine);
    }

    private Domaine findById(Long id) {
        return domaineRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Domaine introuvable"));
    }

    private AdminDomaineResponse toResponse(Domaine domaine) {
        String proprietaire = domaine.isSysteme() ? "Système" : domaine.getCreePar().getUsername();
        return new AdminDomaineResponse(
                domaine.getId(),
                domaine.getNom(),
                domaine.getAttributs(),
                domaine.isSysteme(),
                proprietaire,
                domaine.isActif()
        );
    }
}
