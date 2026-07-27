package dev.joaomendonca.agendapro.customer.api;
import java.time.*;import java.util.UUID;
import dev.joaomendonca.agendapro.customer.domain.*;
public record CustomerResponse(UUID id,String name,String email,String phone,LocalDate birthDate,String notes,CustomerStatus status,Instant createdAt,Instant updatedAt) {
 public static CustomerResponse from(Customer c){return new CustomerResponse(c.getId(),c.getName(),c.getEmail(),c.getPhone(),c.getBirthDate(),c.getNotes(),c.getStatus(),c.getCreatedAt(),c.getUpdatedAt());}
}
