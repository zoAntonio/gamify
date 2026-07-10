package com.gamify.application.services;

import com.gamify.application.dtos.auth.AuthResponse;
import com.gamify.application.dtos.auth.LoginRequest;
import com.gamify.application.dtos.auth.RegisterRequest;
import com.gamify.domain.entities.User;
import com.gamify.domain.exceptions.ConflictException;
import com.gamify.domain.exceptions.UnauthorizedException;
import com.gamify.infrastructure.config.JwtService;
import com.gamify.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

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
        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail());
        return new AuthResponse(token, user.getUsername(), user.getEmail(), user.getNiveau(), user.getXpTotal());
    }

    public AuthResponse login(LoginRequest request) {
        // Même exception pour email introuvable ou mot de passe incorrect :
        // ne pas laisser un attaquant déduire quels emails sont enregistrés.
        User user = userRepository.findByEmail(request.email())
                .filter(u -> passwordEncoder.matches(request.password(), u.getPassword()))
                .orElseThrow(() -> new UnauthorizedException("Email ou mot de passe incorrect"));

        String token = jwtService.generateToken(user.getEmail());
        return new AuthResponse(token, user.getUsername(), user.getEmail(), user.getNiveau(), user.getXpTotal());
    }
}
