package dev.joaomendonca.agendapro.employee.api;
import java.time.*;import java.util.UUID;import dev.joaomendonca.agendapro.employee.domain.EmployeeWorkSchedule;
public record WorkScheduleResponse(UUID id,DayOfWeek dayOfWeek,boolean working,LocalTime startTime,LocalTime endTime,LocalTime breakStart,LocalTime breakEnd){
 public static WorkScheduleResponse from(EmployeeWorkSchedule s){return new WorkScheduleResponse(s.getId(),s.getDayOfWeek(),s.isWorking(),s.getStartTime(),s.getEndTime(),s.getBreakStart(),s.getBreakEnd());}
}
