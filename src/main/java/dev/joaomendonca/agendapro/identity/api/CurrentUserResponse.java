package dev.joaomendonca.agendapro.identity.api;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import dev.joaomendonca.agendapro.identity.domain.User;

public record CurrentUserResponse(UUID id, UUID tenantId, String name, String email, Set<String> roles) {
    public static CurrentUserResponse from(User user) {
        return new CurrentUserResponse(
                user.getId(), user.getTenantId(), user.getName(), user.getEmail(),
                user.getRoles().stream().map(Enum::name).collect(Collectors.toUnmodifiableSet()));
    }
}
