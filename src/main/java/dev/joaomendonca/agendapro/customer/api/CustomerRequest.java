package dev.joaomendonca.agendapro.customer.api;
import java.time.LocalDate;
import jakarta.validation.constraints.*;
public record CustomerRequest(
    @NotBlank @Size(max=120) String name,
    @Email @Size(max=180) String email,
    @Size(max=30) String phone,
    @Past LocalDate birthDate,
    @Size(max=2000) String notes
) {}
