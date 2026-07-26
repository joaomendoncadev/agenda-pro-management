package dev.joaomendonca.agendapro.customer.domain;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "customers", uniqueConstraints = @UniqueConstraint(name = "uk_customers_tenant_email", columnNames = {"tenant_id", "email"}))
@Getter @NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Customer {
    @Id @Column(columnDefinition = "BINARY(16)") private UUID id;
    @Column(name = "tenant_id", nullable = false, columnDefinition = "BINARY(16)") private UUID tenantId;
    @Column(nullable = false, length = 120) private String name;
    @Column(length = 180) private String email;
    @Column(length = 30) private String phone;
    @Column(name = "birth_date") private LocalDate birthDate;
    @Column(length = 2000) private String notes;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private CustomerStatus status;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;

    public Customer(UUID tenantId, String name, String email, String phone, LocalDate birthDate, String notes) {
        this.id = UUID.randomUUID(); this.tenantId = tenantId; this.createdAt = Instant.now(); this.status = CustomerStatus.ACTIVE;
        update(name, email, phone, birthDate, notes);
    }
    public void update(String name, String email, String phone, LocalDate birthDate, String notes) {
        this.name = name.trim(); this.email = normalize(email); this.phone = normalize(phone); this.birthDate = birthDate;
        this.notes = normalize(notes); this.updatedAt = Instant.now();
    }
    public void changeStatus(CustomerStatus status) { this.status = status; this.updatedAt = Instant.now(); }
    private String normalize(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
