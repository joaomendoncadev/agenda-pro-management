package dev.joaomendonca.agendapro.employee.domain;

import java.time.Instant;
import java.util.UUID;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="employee_blocks")
@Getter @NoArgsConstructor(access=AccessLevel.PROTECTED)
public class EmployeeBlock {
 @Id @Column(columnDefinition="BINARY(16)") private UUID id;
 @Column(name="employee_id",nullable=false,columnDefinition="BINARY(16)") private UUID employeeId;
 @Column(name="starts_at",nullable=false) private Instant startsAt;
 @Column(name="ends_at",nullable=false) private Instant endsAt;
 @Column(nullable=false,length=200) private String reason;
 @Column(name="created_at",nullable=false,updatable=false) private Instant createdAt;
 public EmployeeBlock(UUID employeeId, Instant startsAt, Instant endsAt, String reason){
   if(!startsAt.isBefore(endsAt)) throw new IllegalArgumentException("Período de bloqueio inválido.");
   this.id=UUID.randomUUID();this.employeeId=employeeId;this.startsAt=startsAt;this.endsAt=endsAt;this.reason=reason.trim();this.createdAt=Instant.now();
 }
}
