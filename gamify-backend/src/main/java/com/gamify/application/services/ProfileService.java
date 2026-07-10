package com.gamify.application.services;

import com.gamify.application.dtos.profile.DomaineResponse;
import com.gamify.application.dtos.profile.ProfileResponse;
import com.gamify.application.dtos.profile.UpdateProfileRequest;
import com.gamify.domain.entities.Domaine;
import com.gamify.domain.entities.User;
import com.gamify.domain.exceptions.DomainException;
import com.gamify.domain.exceptions.NotFoundException;
import com.gamify.infrastructure.persistence.DomaineRepository;
import com.gamify.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final DomaineRepository domaineRepository;

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

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));
    }

    private ProfileResponse toProfileResponse(User user) {
        Set<Domaine> domaines = user.getDomainesTrackes();
        List<DomaineResponse> domaineResponses = domaines.stream()
                .map(this::toDomaineResponse)
                .collect(Collectors.toList());

        return new ProfileResponse(
                user.getUsername(),
                user.getEmail(),
                user.getAvatar(),
                domaineResponses,
                user.getNiveau(),
                user.getXpTotal()
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
