package dev.joaomendonca.agendapro.appointment.api;import jakarta.validation.constraints.*;import java.time.LocalDateTime;import java.util.UUID;
public record AppointmentRequest(@NotNull UUID customerId,@NotNull UUID employeeId,@NotNull UUID serviceId,@NotNull @FutureOrPresent LocalDateTime startsAt,@Size(max=1000) String notes){}
