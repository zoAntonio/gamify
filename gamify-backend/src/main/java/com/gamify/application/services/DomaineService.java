package com.gamify.application.services;

import com.gamify.application.dtos.profile.CreateDomaineRequest;
import com.gamify.application.dtos.profile.DomaineResponse;
import com.gamify.domain.entities.Domaine;
import com.gamify.domain.entities.User;
import com.gamify.domain.exceptions.NotFoundException;
import com.gamify.infrastructure.persistence.DomaineRepository;
import com.gamify.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DomaineService {

    private final DomaineRepository domaineRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<DomaineResponse> listAvailable(String email) {
        User user = findUserByEmail(email);
        return domaineRepository.findAvailableForUser(user).stream()
                .map(this::toDomaineResponse)
                .toList();
    }

    @Transactional
    public DomaineResponse create(String email, CreateDomaineRequest request) {
        User user = findUserByEmail(email);

        Domaine domaine = new Domaine();
        domaine.setNom(request.nom());
        domaine.setAttributs(request.attributs());
        domaine.setCreePar(user);
        domaineRepository.save(domaine);

        log.info("Domaine personnalisé '{}' créé par {}", domaine.getNom(), email);
        return toDomaineResponse(domaine);
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));
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
