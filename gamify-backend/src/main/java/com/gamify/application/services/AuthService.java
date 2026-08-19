package com.gamify.application.services;

import com.gamify.application.dtos.auth.AuthResponse;
import com.gamify.application.dtos.auth.LoginRequest;
import com.gamify.application.dtos.auth.RegisterRequest;
import com.gamify.domain.entities.User;
import com.gamify.domain.entities.UserProfile;
import com.gamify.domain.exceptions.ConflictException;
import com.gamify.domain.exceptions.NotFoundException;
import com.gamify.domain.exceptions.UnauthorizedException;
import com.gamify.infrastructure.config.JwtService;
import com.gamify.infrastructure.persistence.UserProfileRepository;
import com.gamify.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${gamify.admin.email}")
    private String adminEmail;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email déjà utilisé");
        }
        if (userRepository.existsByUsername(request.username())) {
            throw new ConflictException("Nom d'utilisateur déjà pris");
        }

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        // Un seul admin, désigné par email (gamify.admin.email) : fixé une
        // fois à l'inscription, pas de mécanisme de promotion pour l'instant.
        user.setAdmin(request.email().equalsIgnoreCase(adminEmail));
        userRepository.save(user);

        UserProfile profile = new UserProfile();
        profile.setUser(user);
        userProfileRepository.save(profile);

        log.info("Nouveau compte créé : {}", user.getUsername());
        String token = jwtService.generateToken(user.getEmail());
        return toAuthResponse(user, profile, token);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Même exception pour email introuvable ou mot de passe incorrect :
        // ne pas laisser un attaquant déduire quels emails sont enregistrés.
        User user = userRepository.findByEmail(request.email())
                .filter(u -> passwordEncoder.matches(request.password(), u.getPassword()))
                .orElseThrow(() -> new UnauthorizedException("Email ou mot de passe incorrect"));
        UserProfile profile = userProfileRepository.findById(user.getId())
                .orElseThrow(() -> new NotFoundException("Profil introuvable"));

        log.info("Connexion réussie : {}", user.getUsername());
        String token = jwtService.generateToken(user.getEmail());
        return toAuthResponse(user, profile, token);
    }

    private AuthResponse toAuthResponse(User user, UserProfile profile, String token) {
        return new AuthResponse(
                token, user.getUsername(), user.getEmail(),
                profile.getNiveau(), profile.getXpTotal(), user.isAdmin());
    }
}
