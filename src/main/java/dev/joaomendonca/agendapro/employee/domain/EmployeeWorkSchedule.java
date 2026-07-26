package dev.joaomendonca.agendapro.employee.domain;

import java.time.*;
import java.util.UUID;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "employee_work_schedules", uniqueConstraints = @UniqueConstraint(name="uk_employee_schedule_day", columnNames={"employee_id","day_of_week"}))
@Getter @NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EmployeeWorkSchedule {
    @Id @Column(columnDefinition="BINARY(16)") private UUID id;
    @Column(name="employee_id", nullable=false, columnDefinition="BINARY(16)") private UUID employeeId;
    @Enumerated(EnumType.STRING) @Column(name="day_of_week", nullable=false, length=12) private DayOfWeek dayOfWeek;
    @Column(name="start_time") private LocalTime startTime;
    @Column(name="end_time") private LocalTime endTime;
    @Column(name="break_start") private LocalTime breakStart;
    @Column(name="break_end") private LocalTime breakEnd;
    @Column(nullable=false) private boolean working;

    public EmployeeWorkSchedule(UUID employeeId, DayOfWeek dayOfWeek, boolean working, LocalTime startTime, LocalTime endTime, LocalTime breakStart, LocalTime breakEnd) {
        this.id=UUID.randomUUID(); this.employeeId=employeeId; this.dayOfWeek=dayOfWeek; update(working,startTime,endTime,breakStart,breakEnd);
    }
    public void update(boolean working, LocalTime startTime, LocalTime endTime, LocalTime breakStart, LocalTime breakEnd) {
        if (working && (startTime == null || endTime == null || !startTime.isBefore(endTime))) throw new IllegalArgumentException("Horário de trabalho inválido.");
        if ((breakStart == null) != (breakEnd == null)) throw new IllegalArgumentException("Informe início e fim do intervalo.");
        if (breakStart != null && (!breakStart.isBefore(breakEnd) || breakStart.isBefore(startTime) || breakEnd.isAfter(endTime))) throw new IllegalArgumentException("Intervalo inválido.");
        this.working=working; this.startTime=working?startTime:null; this.endTime=working?endTime:null; this.breakStart=working?breakStart:null; this.breakEnd=working?breakEnd:null;
    }
}
