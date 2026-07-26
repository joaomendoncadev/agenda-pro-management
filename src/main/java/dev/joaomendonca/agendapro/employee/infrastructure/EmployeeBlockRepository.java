package dev.joaomendonca.agendapro.employee.infrastructure;
import java.time.Instant;import java.util.*;import dev.joaomendonca.agendapro.employee.domain.EmployeeBlock;import org.springframework.data.jpa.repository.*;import org.springframework.data.repository.query.Param;
public interface EmployeeBlockRepository extends JpaRepository<EmployeeBlock,UUID>{
 List<EmployeeBlock> findAllByEmployeeIdOrderByStartsAt(UUID employeeId);Optional<EmployeeBlock> findByIdAndEmployeeId(UUID id,UUID employeeId);
 @Query("select count(b)>0 from EmployeeBlock b where b.employeeId=:employeeId and b.startsAt<:endsAt and b.endsAt>:startsAt") boolean existsConflict(@Param("employeeId") UUID employeeId,@Param("startsAt") Instant startsAt,@Param("endsAt") Instant endsAt);
}
