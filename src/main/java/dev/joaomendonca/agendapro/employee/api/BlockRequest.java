package dev.joaomendonca.agendapro.employee.api;
import java.time.Instant;import jakarta.validation.constraints.*;
public record BlockRequest(@NotNull Instant startsAt,@NotNull Instant endsAt,@NotBlank @Size(max=200) String reason) {}
