package dev.joaomendonca.agendapro.employee.infrastructure;
import java.time.DayOfWeek;import java.util.*;
import dev.joaomendonca.agendapro.employee.domain.EmployeeWorkSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
public interface EmployeeWorkScheduleRepository extends JpaRepository<EmployeeWorkSchedule, UUID>{
 List<EmployeeWorkSchedule> findAllByEmployeeIdOrderByDayOfWeek(UUID employeeId);
 Optional<EmployeeWorkSchedule> findByEmployeeIdAndDayOfWeek(UUID employeeId, DayOfWeek dayOfWeek);
}
