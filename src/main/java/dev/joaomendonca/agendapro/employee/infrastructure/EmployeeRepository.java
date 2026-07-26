package dev.joaomendonca.agendapro.employee.infrastructure;
import java.util.*;
import dev.joaomendonca.agendapro.employee.domain.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
public interface EmployeeRepository extends JpaRepository<Employee, UUID> {
 List<Employee> findAllByTenantIdOrderByName(UUID tenantId);
 Optional<Employee> findByIdAndTenantId(UUID id, UUID tenantId);
 boolean existsByTenantIdAndEmailIgnoreCase(UUID tenantId, String email);
 boolean existsByTenantIdAndEmailIgnoreCaseAndIdNot(UUID tenantId, String email, UUID id);
}
