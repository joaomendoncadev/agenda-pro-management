package dev.joaomendonca.agendapro.identity.infrastructure;

import java.util.Optional;
import java.util.UUID;
import dev.joaomendonca.agendapro.identity.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
}
