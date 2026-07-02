package com.gamify.auth;

import com.gamify.config.JwtService;
import com.gamify.user.User;
import com.gamify.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email déjà utilisé");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Nom d'utilisateur déjà pris");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail());
        return new AuthDto.AuthResponse(token, user.getUsername(), user.getEmail(), user.getNiveau(), user.getXpTotal());
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Mot de passe incorrect");
        }

        String token = jwtService.generateToken(user.getEmail());
        return new AuthDto.AuthResponse(token, user.getUsername(), user.getEmail(), user.getNiveau(), user.getXpTotal());
    }
}
