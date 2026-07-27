package dev.joaomendonca.agendapro.finance.domain;
import jakarta.persistence.*;import lombok.*;import java.math.BigDecimal;import java.time.*;import java.util.UUID;
@Entity @Table(name="financial_transactions") @Getter @NoArgsConstructor(access=AccessLevel.PROTECTED)
public class FinancialTransaction{
 @Id @Column(columnDefinition="BINARY(16)") private UUID id; @Column(name="tenant_id",nullable=false,columnDefinition="BINARY(16)") private UUID tenantId; @Column(name="appointment_id",columnDefinition="BINARY(16)") private UUID appointmentId;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private TransactionType type; @Column(nullable=false,length=80) private String category; @Column(nullable=false,length=255) private String description; @Column(nullable=false,precision=12,scale=2) private BigDecimal amount; @Column(name="occurred_on",nullable=false) private LocalDate occurredOn; @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private TransactionStatus status; @Column(name="created_at",nullable=false,updatable=false) private Instant createdAt; @Column(name="updated_at",nullable=false) private Instant updatedAt;
 public FinancialTransaction(UUID tenantId,TransactionType type,String category,String description,BigDecimal amount,LocalDate occurredOn,TransactionStatus status){id=UUID.randomUUID();this.tenantId=tenantId;createdAt=Instant.now();update(type,category,description,amount,occurredOn,status);}
 public void update(TransactionType type,String category,String description,BigDecimal amount,LocalDate occurredOn,TransactionStatus status){this.type=type;this.category=category.trim();this.description=description.trim();this.amount=amount;this.occurredOn=occurredOn;this.status=status;updatedAt=Instant.now();}
}
