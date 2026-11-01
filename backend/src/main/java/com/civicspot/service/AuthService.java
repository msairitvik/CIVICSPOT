package com.civicspot.service;

import com.civicspot.dto.AuthDto;
import com.civicspot.model.Role;
import com.civicspot.model.User;
import com.civicspot.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.email().toLowerCase().trim())) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(request.email().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.CITIZEN);
        user.setPhone(request.phone());
        if (request.preferredLanguage() != null && !request.preferredLanguage().isBlank()) {
            user.setPreferredLanguage(request.preferredLanguage());
        }

        user = userRepository.save(user);
        String token = jwtService.generateToken(user);

        return toAuthResponse(user, token);
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        User user = userRepository.findByEmail(request.email().toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = jwtService.generateToken(user);
        return toAuthResponse(user, token);
    }

    public AuthDto.AuthResponse getCurrentUser(User user) {
        String token = jwtService.generateToken(user);
        return toAuthResponse(user, token);
    }

    @Transactional
    public AuthDto.AuthResponse updateProfile(User user, AuthDto.UpdateProfileRequest request) {
        if (request.name() != null && !request.name().isBlank()) {
            user.setName(request.name().trim());
        }
        if (request.phone() != null) {
            user.setPhone(request.phone());
        }
        if (request.preferredLanguage() != null && !request.preferredLanguage().isBlank()) {
            user.setPreferredLanguage(request.preferredLanguage());
        }
        if (request.wheelchairUser() != null) {
            user.setWheelchairUser(request.wheelchairUser());
        }
        if (request.audioAssistance() != null) {
            user.setAudioAssistance(request.audioAssistance());
        }
        if (request.highContrast() != null) {
            user.setHighContrast(request.highContrast());
        }

        user = userRepository.save(user);
        String token = jwtService.generateToken(user);
        return toAuthResponse(user, token);
    }

    private AuthDto.AuthResponse toAuthResponse(User user, String token) {
        return new AuthDto.AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getPreferredLanguage(),
                user.isWheelchairUser(),
                user.isAudioAssistance(),
                user.isHighContrast()
        );
    }
}
