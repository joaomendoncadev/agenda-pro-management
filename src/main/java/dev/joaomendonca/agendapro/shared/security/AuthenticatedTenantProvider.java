package dev.joaomendonca.agendapro.shared.security;

import java.util.UUID;
import dev.joaomendonca.agendapro.shared.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
public class AuthenticatedTenantProvider {
    public UUID tenantId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication instanceof JwtAuthenticationToken jwt)) {
            throw new UnauthorizedException("INVALID_AUTHENTICATION", "Autenticação inválida.");
        }
        String tenantId = jwt.getToken().getClaimAsString("tenant_id");
        if (tenantId == null) {
            throw new UnauthorizedException("TENANT_NOT_FOUND", "Tenant não encontrado no token.");
        }
        return UUID.fromString(tenantId);
    }
}
