package dev.joaomendonca.agendapro.identity.application;

import java.time.Instant;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import dev.joaomendonca.agendapro.identity.api.*;
import dev.joaomendonca.agendapro.identity.configuration.SecurityProperties;
import dev.joaomendonca.agendapro.identity.domain.*;
import dev.joaomendonca.agendapro.identity.infrastructure.*;
import dev.joaomendonca.agendapro.shared.exception.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final TenantRepository tenants;
    private final UserRepository users;
    private final RefreshTokenRepository refreshTokens;
    private final PasswordEncoder passwords;
    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;
    private final TokenHashService tokenHash;
    private final SecurityProperties properties;

    public AuthService(TenantRepository tenants, UserRepository users,
                       RefreshTokenRepository refreshTokens, PasswordEncoder passwords,
                       AuthenticationManager authenticationManager, TokenService tokenService,
                       TokenHashService tokenHash, SecurityProperties properties) {
        this.tenants = tenants;
        this.users = users;
        this.refreshTokens = refreshTokens;
        this.passwords = passwords;
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
        this.tokenHash = tokenHash;
        this.properties = properties;
    }

    @Transactional
    public TokenResponse bootstrap(String key, BootstrapRequest request) {
        if (!properties.bootstrapKey().equals(key)) {
            throw new UnauthorizedException("INVALID_BOOTSTRAP_KEY", "Bootstrap key inválida.");
        }
        if (users.count() > 0) {
            throw new ConflictException("BOOTSTRAP_ALREADY_COMPLETED", "A configuração inicial já foi concluída.");
        }

        String email = normalize(request.email());
        String slug = request.tenantSlug().toLowerCase(Locale.ROOT);
        if (tenants.existsBySlug(slug)) {
            throw new ConflictException("TENANT_SLUG_ALREADY_EXISTS", "O identificador já existe.");
        }
        if (users.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("EMAIL_ALREADY_EXISTS", "O e-mail já existe.");
        }

        Tenant tenant = tenants.save(new Tenant(UUID.randomUUID(), request.tenantName().trim(), slug));
        User owner = users.save(new User(
                UUID.randomUUID(), tenant.getId(), request.ownerName().trim(), email,
                passwords.encode(request.password()), Set.of(Role.OWNER, Role.ADMIN)));
        return tokenService.issue(owner);
    }

    @Transactional
    public TokenResponse login(LoginRequest request) {
        String email = normalize(request.email());
        try {
            authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(email, request.password()));
        } catch (AuthenticationException ex) {
            throw new UnauthorizedException("INVALID_CREDENTIALS", "Credenciais inválidas.");
        }
        User user = users.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UnauthorizedException("INVALID_CREDENTIALS", "Credenciais inválidas."));
        return tokenService.issue(user);
    }

    @Transactional
    public TokenResponse refresh(String rawToken) {
        RefreshToken token = refreshTokens.findByTokenHash(tokenHash.hash(rawToken))
                .orElseThrow(() -> new UnauthorizedException("INVALID_REFRESH_TOKEN", "Refresh token inválido."));
        Instant now = Instant.now();
        if (!token.isUsableAt(now)) {
            throw new UnauthorizedException("INVALID_REFRESH_TOKEN", "Refresh token expirado ou revogado.");
        }
        token.revoke(now);
        User user = users.findById(token.getUserId()).filter(User::isActive)
                .orElseThrow(() -> new UnauthorizedException("INVALID_REFRESH_TOKEN", "Usuário inválido."));
        return tokenService.issue(user);
    }

    @Transactional
    public void logout(String rawToken) {
        refreshTokens.findByTokenHash(tokenHash.hash(rawToken))
                .filter(token -> token.isUsableAt(Instant.now()))
                .ifPresent(token -> token.revoke(Instant.now()));
    }

    private String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
