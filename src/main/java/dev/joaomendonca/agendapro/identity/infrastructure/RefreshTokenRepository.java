package dev.joaomendonca.agendapro.identity.infrastructure;

import java.util.Optional;
import java.util.UUID;
import dev.joaomendonca.agendapro.identity.domain.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);
}
