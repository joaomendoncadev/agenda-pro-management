package dev.joaomendonca.agendapro.finance.api; import java.math.BigDecimal; public record FinanceSummaryResponse(BigDecimal income,BigDecimal expenses,BigDecimal balance,long pendingCount){}
