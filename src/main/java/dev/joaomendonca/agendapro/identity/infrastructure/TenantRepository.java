package dev.joaomendonca.agendapro.identity.infrastructure;

import java.util.UUID;
import dev.joaomendonca.agendapro.identity.domain.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantRepository extends JpaRepository<Tenant, UUID> {
    boolean existsBySlug(String slug);
}
