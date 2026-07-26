package dev.joaomendonca.agendapro.employee.api;
import dev.joaomendonca.agendapro.employee.domain.EmployeeStatus;import jakarta.validation.constraints.NotNull;
public record EmployeeStatusRequest(@NotNull EmployeeStatus status) {}
