package dev.joaomendonca.agendapro.service.api;
import jakarta.validation.constraints.*;import java.math.BigDecimal;
public record ServiceRequest(@NotBlank @Size(max=120) String name,@Size(max=1000) String description,@NotNull @Min(5) @Max(1440) Integer durationMinutes,@NotNull @DecimalMin("0.00") BigDecimal price,@Size(max=80) String category,@DecimalMin("0.00") @DecimalMax("100.00") BigDecimal commissionPercentage){}
