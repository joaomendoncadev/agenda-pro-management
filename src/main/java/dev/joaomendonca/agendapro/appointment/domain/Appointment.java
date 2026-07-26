package dev.joaomendonca.agendapro.appointment.domain;
import jakarta.persistence.*;import lombok.*;import java.math.BigDecimal;import java.time.*;import java.util.UUID;
@Entity @Table(name="appointments") @Getter @NoArgsConstructor(access=AccessLevel.PROTECTED)
public class Appointment{
 @Id @Column(columnDefinition="BINARY(16)") private UUID id;@Column(name="tenant_id",nullable=false,columnDefinition="BINARY(16)") private UUID tenantId;
 @Column(name="customer_id",nullable=false,columnDefinition="BINARY(16)") private UUID customerId;@Column(name="employee_id",nullable=false,columnDefinition="BINARY(16)") private UUID employeeId;@Column(name="service_id",nullable=false,columnDefinition="BINARY(16)") private UUID serviceId;
 @Column(name="starts_at",nullable=false) private LocalDateTime startsAt;@Column(name="ends_at",nullable=false) private LocalDateTime endsAt;@Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private AppointmentStatus status;
 @Column(length=1000) private String notes;@Column(nullable=false,precision=12,scale=2) private BigDecimal price;@Column(name="created_at",nullable=false,updatable=false) private Instant createdAt;@Column(name="updated_at",nullable=false) private Instant updatedAt;
 public Appointment(UUID tenantId,UUID customerId,UUID employeeId,UUID serviceId,LocalDateTime startsAt,LocalDateTime endsAt,String notes,BigDecimal price){id=UUID.randomUUID();this.tenantId=tenantId;createdAt=Instant.now();status=AppointmentStatus.SCHEDULED;update(customerId,employeeId,serviceId,startsAt,endsAt,notes,price);}
 public void update(UUID customerId,UUID employeeId,UUID serviceId,LocalDateTime startsAt,LocalDateTime endsAt,String notes,BigDecimal price){this.customerId=customerId;this.employeeId=employeeId;this.serviceId=serviceId;this.startsAt=startsAt;this.endsAt=endsAt;this.notes=notes==null||notes.isBlank()?null:notes.trim();this.price=price;updatedAt=Instant.now();}
 public void changeStatus(AppointmentStatus status){this.status=status;updatedAt=Instant.now();}
}
