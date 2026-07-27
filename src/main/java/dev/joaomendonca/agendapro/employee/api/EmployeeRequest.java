package dev.joaomendonca.agendapro.employee.api;
import jakarta.validation.constraints.*;
public record EmployeeRequest(
 @NotBlank @Size(max=120) String name,
 @NotBlank @Size(max=120) String position,
 @Email @Size(max=180) String email,
 @Size(max=30) String phone,
 @Size(max=500) String photoUrl) {}
