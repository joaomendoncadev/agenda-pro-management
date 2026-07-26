package dev.joaomendonca.agendapro.customer.api;
import dev.joaomendonca.agendapro.customer.domain.CustomerStatus;
import jakarta.validation.constraints.NotNull;
public record CustomerStatusRequest(@NotNull CustomerStatus status) {}
