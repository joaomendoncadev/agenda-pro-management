package dev.joaomendonca.agendapro.customer.infrastructure;

import java.util.*;
import dev.joaomendonca.agendapro.customer.domain.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    List<Customer> findAllByTenantIdOrderByName(UUID tenantId);
    Optional<Customer> findByIdAndTenantId(UUID id, UUID tenantId);
    boolean existsByTenantIdAndEmailIgnoreCase(UUID tenantId, String email);
    boolean existsByTenantIdAndEmailIgnoreCaseAndIdNot(UUID tenantId, String email, UUID id);
}
