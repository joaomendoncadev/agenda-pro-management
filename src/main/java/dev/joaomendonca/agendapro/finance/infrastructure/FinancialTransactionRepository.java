package dev.joaomendonca.agendapro.finance.infrastructure;
import dev.joaomendonca.agendapro.finance.domain.*;import org.springframework.data.jpa.repository.JpaRepository;import java.time.LocalDate;import java.util.*;
public interface FinancialTransactionRepository extends JpaRepository<FinancialTransaction,UUID>{List<FinancialTransaction> findAllByTenantIdAndOccurredOnBetweenOrderByOccurredOnDesc(UUID tenantId,LocalDate from,LocalDate to);Optional<FinancialTransaction> findByIdAndTenantId(UUID id,UUID tenantId);}
