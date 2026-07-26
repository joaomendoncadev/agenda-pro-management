package dev.joaomendonca.agendapro.employee.api;
import java.time.Instant;import java.util.UUID;import dev.joaomendonca.agendapro.employee.domain.EmployeeBlock;
public record BlockResponse(UUID id,Instant startsAt,Instant endsAt,String reason,Instant createdAt){public static BlockResponse from(EmployeeBlock b){return new BlockResponse(b.getId(),b.getStartsAt(),b.getEndsAt(),b.getReason(),b.getCreatedAt());}}
