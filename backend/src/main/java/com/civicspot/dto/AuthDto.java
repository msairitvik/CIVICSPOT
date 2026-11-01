package com.civicspot.dto;

import com.civicspot.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDto {

    public record RegisterRequest(
            @NotBlank(message = "Name is required")
            @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
            String name,

            @NotBlank(message = "Email is required")
            @Email(message = "Invalid email format")
            String email,

            @NotBlank(message = "Password is required")
            @Size(min = 6, max = 50, message = "Password must be at least 6 characters")
            String password,

            String phone,
            String preferredLanguage
    ) {}

    public record LoginRequest(
            @NotBlank(message = "Email is required")
            @Email(message = "Invalid email format")
            String email,

            @NotBlank(message = "Password is required")
            String password
    ) {}

    public record AuthResponse(
            String token,
            Long id,
            String name,
            String email,
            Role role,
            String preferredLanguage,
            boolean wheelchairUser,
            boolean audioAssistance,
            boolean highContrast
    ) {}

    public record UpdateProfileRequest(
            String name,
            String phone,
            String preferredLanguage,
            Boolean wheelchairUser,
            Boolean audioAssistance,
            Boolean highContrast
    ) {}
}
