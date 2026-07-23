package dev.joaomendonca.agendapro.identity.api;

import jakarta.validation.constraints.*;

public record BootstrapRequest(
        @NotBlank @Size(max = 120) String tenantName,
        @NotBlank @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$") @Size(max = 80) String tenantSlug,
        @NotBlank @Size(max = 120) String ownerName,
        @NotBlank @Email @Size(max = 180) String email,
        @NotBlank @Size(min = 12, max = 72) String password) {
}
