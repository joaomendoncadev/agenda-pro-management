package dev.joaomendonca.agendapro.service.domain;
import jakarta.persistence.*;import lombok.*;import java.math.BigDecimal;import java.time.Instant;import java.util.UUID;
@Entity @Table(name="services",uniqueConstraints=@UniqueConstraint(name="uk_services_tenant_name",columnNames={"tenant_id","name"}))
@Getter @NoArgsConstructor(access=AccessLevel.PROTECTED)
public class ServiceOffering {
 @Id @Column(columnDefinition="BINARY(16)") private UUID id;
 @Column(name="tenant_id",nullable=false,columnDefinition="BINARY(16)") private UUID tenantId;
 @Column(nullable=false,length=120) private String name; @Column(length=1000) private String description;
 @Column(name="duration_minutes",nullable=false) private Integer durationMinutes; @Column(nullable=false,precision=12,scale=2) private BigDecimal price;
 @Column(length=80) private String category; @Column(name="commission_percentage",precision=5,scale=2) private BigDecimal commissionPercentage;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private ServiceStatus status;
 @Column(name="created_at",nullable=false,updatable=false) private Instant createdAt; @Column(name="updated_at",nullable=false) private Instant updatedAt;
 public ServiceOffering(UUID tenantId,String name,String description,Integer durationMinutes,BigDecimal price,String category,BigDecimal commissionPercentage){id=UUID.randomUUID();this.tenantId=tenantId;createdAt=Instant.now();status=ServiceStatus.ACTIVE;update(name,description,durationMinutes,price,category,commissionPercentage);}
 public void update(String name,String description,Integer durationMinutes,BigDecimal price,String category,BigDecimal commissionPercentage){this.name=name.trim();this.description=norm(description);this.durationMinutes=durationMinutes;this.price=price;this.category=norm(category);this.commissionPercentage=commissionPercentage;updatedAt=Instant.now();}
 public void changeStatus(ServiceStatus status){this.status=status;updatedAt=Instant.now();} private String norm(String v){return v==null||v.isBlank()?null:v.trim();}
}
