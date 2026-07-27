package dev.joaomendonca.agendapro.inventory.api;

import dev.joaomendonca.agendapro.shared.exception.ConflictException;
import dev.joaomendonca.agendapro.shared.exception.NotFoundException;
import dev.joaomendonca.agendapro.shared.security.AuthenticatedTenantProvider;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.nio.ByteBuffer;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class InventoryController {
    private final JdbcTemplate jdbc;
    private final AuthenticatedTenantProvider tenant;

    public InventoryController(JdbcTemplate jdbc, AuthenticatedTenantProvider tenant) {
        this.jdbc = jdbc;
        this.tenant = tenant;
    }

    @GetMapping("/products")
    public List<Map<String, Object>> products(@RequestParam(defaultValue = "false") boolean includeInactive) {
        String activeFilter = includeInactive ? "" : " and active=true";
        return jdbc.queryForList("""
                select bin_to_uuid(id) id,name,sku,category,sale_price salePrice,cost_price costPrice,
                       stock_quantity stockQuantity,minimum_stock minimumStock,active,created_at createdAt,updated_at updatedAt
                from products where tenant_id=?""" + activeFilter + " order by name", bytes(tenant.tenantId()));
    }

    @PostMapping("/products")
    @Transactional
    public Map<String, Object> createProduct(@Valid @RequestBody ProductRequest request) {
        UUID id = UUID.randomUUID();
        Instant now = Instant.now();
        jdbc.update("""
                insert into products(id,tenant_id,name,sku,category,sale_price,cost_price,stock_quantity,minimum_stock,active,created_at,updated_at)
                values(?,?,?,?,?,?,?,?,?,true,?,?)
                """, bytes(id), bytes(tenant.tenantId()), request.name(), blankToNull(request.sku()), blankToNull(request.category()),
                request.salePrice(), request.costPrice(), request.initialStock(), request.minimumStock(), Timestamp.from(now), Timestamp.from(now));
        if (request.initialStock().compareTo(BigDecimal.ZERO) > 0) {
            insertMovement(id, "ENTRY", request.initialStock(), request.costPrice(), "Estoque inicial");
        }
        return Map.of("id", id, "name", request.name(), "active", true);
    }

    @PutMapping("/products/{id}")
    @Transactional
    public void updateProduct(@PathVariable UUID id, @Valid @RequestBody ProductUpdateRequest request) {
        int updated = jdbc.update("""
                update products set name=?,sku=?,category=?,sale_price=?,cost_price=?,minimum_stock=?,active=?,updated_at=?
                where id=? and tenant_id=?
                """, request.name(), blankToNull(request.sku()), blankToNull(request.category()), request.salePrice(), request.costPrice(),
                request.minimumStock(), request.active(), Timestamp.from(Instant.now()), bytes(id), bytes(tenant.tenantId()));
        if (updated == 0) throw new NotFoundException("PRODUCT_NOT_FOUND", "Produto não encontrado.");
    }

    @PostMapping("/products/{id}/movements")
    @Transactional
    public void moveStock(@PathVariable UUID id, @Valid @RequestBody MovementRequest request) {
        UUID tenantId = tenant.tenantId();
        List<Map<String, Object>> rows = jdbc.queryForList(
                "select stock_quantity from products where id=? and tenant_id=? and active=true for update", bytes(id), bytes(tenantId));
        if (rows.isEmpty()) throw new NotFoundException("PRODUCT_NOT_FOUND", "Produto ativo não encontrado.");
        BigDecimal current = (BigDecimal) rows.getFirst().get("stock_quantity");
        BigDecimal delta = switch (request.type()) {
            case "ENTRY" -> request.quantity();
            case "EXIT" -> request.quantity().negate();
            case "ADJUSTMENT" -> request.quantity().subtract(current);
            default -> throw new ConflictException("INVALID_MOVEMENT", "Tipo de movimentação inválido.");
        };
        BigDecimal resulting = current.add(delta);
        if (resulting.compareTo(BigDecimal.ZERO) < 0) {
            throw new ConflictException("INSUFFICIENT_STOCK", "A saída deixaria o estoque negativo.");
        }
        jdbc.update("update products set stock_quantity=?,updated_at=? where id=? and tenant_id=?",
                resulting, Timestamp.from(Instant.now()), bytes(id), bytes(tenantId));
        insertMovement(id, request.type(), request.type().equals("ADJUSTMENT") ? resulting : request.quantity(), request.unitCost(), request.reason());
    }

    @GetMapping("/inventory/movements")
    public List<Map<String, Object>> movements(@RequestParam(required = false) UUID productId) {
        if (productId == null) {
            return jdbc.queryForList("""
                    select bin_to_uuid(m.id) id,bin_to_uuid(m.product_id) productId,p.name productName,m.movement_type type,
                           m.quantity,m.unit_cost unitCost,m.reason,m.occurred_at occurredAt
                    from inventory_movements m join products p on p.id=m.product_id
                    where m.tenant_id=? order by m.occurred_at desc limit 200
                    """, bytes(tenant.tenantId()));
        }
        return jdbc.queryForList("""
                select bin_to_uuid(m.id) id,bin_to_uuid(m.product_id) productId,p.name productName,m.movement_type type,
                       m.quantity,m.unit_cost unitCost,m.reason,m.occurred_at occurredAt
                from inventory_movements m join products p on p.id=m.product_id
                where m.tenant_id=? and m.product_id=? order by m.occurred_at desc limit 200
                """, bytes(tenant.tenantId()), bytes(productId));
    }

    @GetMapping("/commissions")
    public Map<String, Object> commissions(@RequestParam(required = false) LocalDate from,
                                            @RequestParam(required = false) LocalDate to) {
        LocalDate start = from == null ? LocalDate.now().withDayOfMonth(1) : from;
        LocalDate end = to == null ? start.plusMonths(1).minusDays(1) : to;
        UUID tid = tenant.tenantId();
        var rows = jdbc.queryForList("""
                select bin_to_uuid(e.id) employeeId,e.name employeeName,
                       coalesce(sum(case when ce.status='PENDING' then ce.commission_amount else 0 end),0) pending,
                       coalesce(sum(case when ce.status='PAID' then ce.commission_amount else 0 end),0) paid,
                       coalesce(sum(ce.commission_amount),0) total
                from employees e left join commission_entries ce on ce.employee_id=e.id and ce.occurred_on between ? and ?
                where e.tenant_id=? group by e.id,e.name order by total desc
                """, start, end, bytes(tid));
        BigDecimal pending = decimal("select coalesce(sum(commission_amount),0) from commission_entries where tenant_id=? and occurred_on between ? and ? and status='PENDING'", bytes(tid), start, end);
        BigDecimal paid = decimal("select coalesce(sum(commission_amount),0) from commission_entries where tenant_id=? and occurred_on between ? and ? and status='PAID'", bytes(tid), start, end);
        return Map.of("from", start, "to", end, "pending", pending, "paid", paid, "total", pending.add(paid), "employees", rows);
    }

    @PostMapping("/commissions/{employeeId}/generate")
    @Transactional
    public Map<String, Object> generateCommission(@PathVariable UUID employeeId, @Valid @RequestBody CommissionRequest request) {
        UUID tid = tenant.tenantId();
        Long employeeExists = count("select count(*) from employees where id=? and tenant_id=?", bytes(employeeId), bytes(tid));
        if (employeeExists == 0) throw new NotFoundException("EMPLOYEE_NOT_FOUND", "Profissional não encontrado.");
        BigDecimal amount = request.baseAmount().multiply(request.percentage()).divide(BigDecimal.valueOf(100));
        UUID id = UUID.randomUUID();
        jdbc.update("""
                insert into commission_entries(id,tenant_id,employee_id,description,base_amount,percentage,commission_amount,occurred_on,status,created_at)
                values(?,?,?,?,?,?,?,?, 'PENDING',?)
                """, bytes(id), bytes(tid), bytes(employeeId), request.description(), request.baseAmount(), request.percentage(), amount,
                request.occurredOn(), Timestamp.from(Instant.now()));
        return Map.of("id", id, "commissionAmount", amount, "status", "PENDING");
    }

    @PostMapping("/commissions/{employeeId}/pay")
    @Transactional
    public Map<String, Object> payCommissions(@PathVariable UUID employeeId, @Valid @RequestBody CommissionPaymentRequest request) {
        UUID tid = tenant.tenantId();
        BigDecimal amount = decimal("""
                select coalesce(sum(commission_amount),0) from commission_entries
                where tenant_id=? and employee_id=? and occurred_on between ? and ? and status='PENDING'
                """, bytes(tid), bytes(employeeId), request.from(), request.to());
        int updated = jdbc.update("""
                update commission_entries set status='PAID',paid_at=?
                where tenant_id=? and employee_id=? and occurred_on between ? and ? and status='PENDING'
                """, Timestamp.from(Instant.now()), bytes(tid), bytes(employeeId), request.from(), request.to());
        if (updated > 0) {
            Instant now = Instant.now();
            jdbc.update("""
                    insert into financial_transactions(id,tenant_id,type,category,description,amount,occurred_on,status,created_at,updated_at)
                    values(?,?,'EXPENSE','COMISSÃO','Pagamento de comissão',?,current_date,'PAID',?,?)
                    """, bytes(UUID.randomUUID()), bytes(tid), amount, Timestamp.from(now), Timestamp.from(now));
        }
        return Map.of("paidEntries", updated, "amount", amount);
    }

    private void insertMovement(UUID productId, String type, BigDecimal quantity, BigDecimal unitCost, String reason) {
        Instant now = Instant.now();
        jdbc.update("""
                insert into inventory_movements(id,tenant_id,product_id,movement_type,quantity,unit_cost,reason,occurred_at,created_at)
                values(?,?,?,?,?,?,?,?,?)
                """, bytes(UUID.randomUUID()), bytes(tenant.tenantId()), bytes(productId), type, quantity, unitCost,
                reason, Timestamp.from(now), Timestamp.from(now));
    }

    private Long count(String sql, Object... args) {
        Long value = jdbc.queryForObject(sql, Long.class, args);
        return value == null ? 0 : value;
    }

    private BigDecimal decimal(String sql, Object... args) {
        BigDecimal value = jdbc.queryForObject(sql, BigDecimal.class, args);
        return value == null ? BigDecimal.ZERO : value;
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static byte[] bytes(UUID id) {
        ByteBuffer buffer = ByteBuffer.allocate(16);
        buffer.putLong(id.getMostSignificantBits());
        buffer.putLong(id.getLeastSignificantBits());
        return buffer.array();
    }

    public record ProductRequest(@NotBlank String name, String sku, String category,
                                 @NotNull @DecimalMin("0.00") BigDecimal salePrice,
                                 @NotNull @DecimalMin("0.00") BigDecimal costPrice,
                                 @NotNull @DecimalMin("0.00") BigDecimal initialStock,
                                 @NotNull @DecimalMin("0.00") BigDecimal minimumStock) {}

    public record ProductUpdateRequest(@NotBlank String name, String sku, String category,
                                       @NotNull @DecimalMin("0.00") BigDecimal salePrice,
                                       @NotNull @DecimalMin("0.00") BigDecimal costPrice,
                                       @NotNull @DecimalMin("0.00") BigDecimal minimumStock,
                                       boolean active) {}

    public record MovementRequest(@NotBlank String type,
                                  @NotNull @DecimalMin("0.00") BigDecimal quantity,
                                  BigDecimal unitCost,
                                  @NotBlank String reason) {}

    public record CommissionRequest(@NotBlank String description,
                                    @NotNull @DecimalMin("0.01") BigDecimal baseAmount,
                                    @NotNull @DecimalMin("0.01") BigDecimal percentage,
                                    @NotNull LocalDate occurredOn) {}

    public record CommissionPaymentRequest(@NotNull LocalDate from, @NotNull LocalDate to) {}
}
