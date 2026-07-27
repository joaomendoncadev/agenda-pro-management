package dev.joaomendonca.agendapro.identity.application;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

import dev.joaomendonca.agendapro.identity.api.TokenResponse;
import dev.joaomendonca.agendapro.identity.configuration.SecurityProperties;
import dev.joaomendonca.agendapro.identity.domain.RefreshToken;
import dev.joaomendonca.agendapro.identity.domain.User;
import dev.joaomendonca.agendapro.identity.infrastructure.RefreshTokenRepository;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TokenService {
    private final JwtEncoder jwtEncoder;
    private final RefreshTokenRepository refreshTokens;
    private final TokenHashService tokenHash;
    private final SecurityProperties properties;
    private final SecureRandom random = new SecureRandom();

    public TokenService(JwtEncoder jwtEncoder, RefreshTokenRepository refreshTokens,
                        TokenHashService tokenHash, SecurityProperties properties) {
        this.jwtEncoder = jwtEncoder;
        this.refreshTokens = refreshTokens;
        this.tokenHash = tokenHash;
        this.properties = properties;
    }

    @Transactional
    public TokenResponse issue(User user) {
        Instant now = Instant.now();
        Instant accessExpiry = now.plus(properties.accessTokenTtl());
        Instant refreshExpiry = now.plus(properties.refreshTokenTtl());

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(properties.issuer())
                .issuedAt(now)
                .expiresAt(accessExpiry)
                .subject(user.getId().toString())
                .claim("tenant_id", user.getTenantId().toString())
                .claim("email", user.getEmail())
                .claim("name", user.getName())
                .claim("roles", user.getRoles().stream().map(Enum::name).sorted().toList())
                .build();

        String accessToken = jwtEncoder.encode(JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();

        byte[] bytes = new byte[64];
        random.nextBytes(bytes);
        String refreshToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        refreshTokens.save(new RefreshToken(
                UUID.randomUUID(), user.getId(), tokenHash.hash(refreshToken), refreshExpiry));

        return new TokenResponse("Bearer", accessToken, accessExpiry, refreshToken, refreshExpiry);
    }
}
