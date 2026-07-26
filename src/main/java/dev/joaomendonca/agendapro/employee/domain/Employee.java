package dev.joaomendonca.agendapro.employee.domain;

import java.time.Instant;
import java.util.UUID;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "employees", uniqueConstraints = @UniqueConstraint(name = "uk_employees_tenant_email", columnNames = {"tenant_id", "email"}))
@Getter @NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Employee {
    @Id @Column(columnDefinition = "BINARY(16)") private UUID id;
    @Column(name = "tenant_id", nullable = false, columnDefinition = "BINARY(16)") private UUID tenantId;
    @Column(nullable = false, length = 120) private String name;
    @Column(nullable = false, length = 120) private String position;
    @Column(length = 180) private String email;
    @Column(length = 30) private String phone;
    @Column(name = "photo_url", length = 500) private String photoUrl;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private EmployeeStatus status;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;

    public Employee(UUID tenantId, String name, String position, String email, String phone, String photoUrl) {
        this.id = UUID.randomUUID(); this.tenantId = tenantId; this.createdAt = Instant.now();
        update(name, position, email, phone, photoUrl); this.status = EmployeeStatus.ACTIVE;
    }
    public void update(String name, String position, String email, String phone, String photoUrl) {
        this.name = name.trim(); this.position = position.trim();
        this.email = normalize(email); this.phone = normalize(phone); this.photoUrl = normalize(photoUrl); this.updatedAt = Instant.now();
    }
    public void changeStatus(EmployeeStatus status) { this.status = status; this.updatedAt = Instant.now(); }
    private String normalize(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
