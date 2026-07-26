package dev.joaomendonca.agendapro.employee.api;
import java.time.*;import jakarta.validation.constraints.NotNull;
public record WorkScheduleRequest(@NotNull DayOfWeek dayOfWeek, boolean working, LocalTime startTime, LocalTime endTime, LocalTime breakStart, LocalTime breakEnd) {}
