package dev.joaomendonca.agendapro.employee.api;
import java.time.Instant;import java.util.UUID;import dev.joaomendonca.agendapro.employee.domain.*;
public record EmployeeResponse(UUID id,String name,String position,String email,String phone,String photoUrl,EmployeeStatus status,Instant createdAt,Instant updatedAt){
 public static EmployeeResponse from(Employee e){return new EmployeeResponse(e.getId(),e.getName(),e.getPosition(),e.getEmail(),e.getPhone(),e.getPhotoUrl(),e.getStatus(),e.getCreatedAt(),e.getUpdatedAt());}
}
