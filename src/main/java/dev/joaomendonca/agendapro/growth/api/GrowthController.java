package dev.joaomendonca.agendapro.growth.api;

import dev.joaomendonca.agendapro.shared.exception.ConflictException;
import dev.joaomendonca.agendapro.shared.exception.NotFoundException;
import dev.joaomendonca.agendapro.shared.security.AuthenticatedTenantProvider;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.nio.ByteBuffer;
import java.sql.Timestamp;
import java.time.*;
import java.util.*;

@RestController
public class GrowthController {
    private final JdbcTemplate jdbc;
    private final AuthenticatedTenantProvider tenant;

    public GrowthController(JdbcTemplate jdbc, AuthenticatedTenantProvider tenant) {
        this.jdbc = jdbc;
        this.tenant = tenant;
    }

    @GetMapping("/api/v1/analytics")
    public Map<String, Object> analytics(@RequestParam(required = false) LocalDate from,
                                         @RequestParam(required = false) LocalDate to) {
        UUID tid = tenant.tenantId();
        LocalDate start = from == null ? LocalDate.now().withDayOfMonth(1) : from;
        LocalDate end = to == null ? start.plusMonths(1).minusDays(1) : to;
        var params = new Object[]{bytes(tid), start, end};
        BigDecimal revenue = decimal("select coalesce(sum(price),0) from appointments where tenant_id=? and date(starts_at) between ? and ? and status='COMPLETED'", params);
        Long completed = count("select count(*) from appointments where tenant_id=? and date(starts_at) between ? and ? and status='COMPLETED'", params);
        Long cancelled = count("select count(*) from appointments where tenant_id=? and date(starts_at) between ? and ? and status='CANCELLED'", params);
        Long noShows = count("select count(*) from appointments where tenant_id=? and date(starts_at) between ? and ? and status='NO_SHOW'", params);
        BigDecimal avgTicket = completed == 0 ? BigDecimal.ZERO : revenue.divide(BigDecimal.valueOf(completed), 2, java.math.RoundingMode.HALF_UP);
        List<Map<String,Object>> byEmployee = jdbc.queryForList("""
                select e.name label, coalesce(sum(a.price),0) value
                from employees e left join appointments a on a.employee_id=e.id and a.status='COMPLETED' and date(a.starts_at) between ? and ?
                where e.tenant_id=? group by e.id,e.name order by value desc limit 8
                """, start, end, bytes(tid));
        List<Map<String,Object>> byService = jdbc.queryForList("""
                select s.name label, count(a.id) value
                from services s left join appointments a on a.service_id=s.id and a.status<>'CANCELLED' and date(a.starts_at) between ? and ?
                where s.tenant_id=? group by s.id,s.name order by value desc limit 8
                """, start, end, bytes(tid));
        List<Map<String,Object>> heatmap = jdbc.queryForList("""
                select dayofweek(starts_at) day, hour(starts_at) hour, count(*) value
                from appointments where tenant_id=? and date(starts_at) between ? and ? and status<>'CANCELLED'
                group by dayofweek(starts_at), hour(starts_at)
                """, bytes(tid), start, end);
        return Map.of("from",start,"to",end,"revenue",revenue,"averageTicket",avgTicket,"completed",completed,
                "cancelled",cancelled,"noShows",noShows,"revenueByEmployee",byEmployee,"appointmentsByService",byService,"heatmap",heatmap);
    }

    @GetMapping("/api/v1/customers/{id}/profile")
    public Map<String,Object> customerProfile(@PathVariable UUID id) {
        UUID tid=tenant.tenantId();
        List<Map<String,Object>> customer=jdbc.queryForList("select name,email,phone,birth_date,notes,status from customers where id=? and tenant_id=?",bytes(id),bytes(tid));
        if(customer.isEmpty()) throw new NotFoundException("CUSTOMER_NOT_FOUND","Cliente não encontrado.");
        List<Map<String,Object>> history=jdbc.queryForList("""
                select a.id,a.starts_at,a.ends_at,a.status,a.price,s.name service_name,e.name employee_name
                from appointments a join services s on s.id=a.service_id join employees e on e.id=a.employee_id
                where a.customer_id=? and a.tenant_id=? order by a.starts_at desc limit 50
                """,bytes(id),bytes(tid));
        BigDecimal spent=decimal("select coalesce(sum(price),0) from appointments where customer_id=? and tenant_id=? and status='COMPLETED'",bytes(id),bytes(tid));
        Long visits=count("select count(*) from appointments where customer_id=? and tenant_id=? and status='COMPLETED'",bytes(id),bytes(tid));
        return Map.of("customer",customer.getFirst(),"history",history,"totalSpent",spent,"completedVisits",visits);
    }

    @GetMapping("/api/v1/units")
    public List<Map<String,Object>> units(){return jdbc.queryForList("select bin_to_uuid(id) id,name,slug,address,phone,active from business_units where tenant_id=? order by name",bytes(tenant.tenantId()));}

    @PostMapping("/api/v1/units") @Transactional
    public Map<String,Object> createUnit(@Valid @RequestBody UnitRequest r){UUID id=UUID.randomUUID(),tid=tenant.tenantId();Instant now=Instant.now();jdbc.update("insert into business_units(id,tenant_id,name,slug,address,phone,active,created_at,updated_at) values(?,?,?,?,?,?,true,?,?)",bytes(id),bytes(tid),r.name(),r.slug(),r.address(),r.phone(),Timestamp.from(now),Timestamp.from(now));return Map.of("id",id,"name",r.name(),"slug",r.slug(),"active",true);}

    @GetMapping("/api/v1/orders")
    public List<Map<String,Object>> orders(){return jdbc.queryForList("""
            select bin_to_uuid(o.id) id,bin_to_uuid(o.customer_id) customerId,c.name customerName,o.status,o.total,o.discount,o.payment_method paymentMethod,o.opened_at openedAt,o.closed_at closedAt
            from service_orders o join customers c on c.id=o.customer_id where o.tenant_id=? order by o.opened_at desc limit 100
            """,bytes(tenant.tenantId()));}

    @GetMapping("/api/v1/orders/{id}")
    public Map<String,Object> order(@PathVariable UUID id){
        UUID tid=tenant.tenantId();
        var rows=jdbc.queryForList("""
                select bin_to_uuid(o.id) id,bin_to_uuid(o.customer_id) customerId,c.name customerName,o.status,o.total,o.discount,o.payment_method paymentMethod,o.opened_at openedAt,o.closed_at closedAt,o.notes
                from service_orders o join customers c on c.id=o.customer_id where o.id=? and o.tenant_id=?
                """,bytes(id),bytes(tid));
        if(rows.isEmpty()) throw new NotFoundException("ORDER_NOT_FOUND","Comanda não encontrada.");
        var result=new LinkedHashMap<String,Object>(rows.getFirst());
        result.put("items",jdbc.queryForList("""
                select bin_to_uuid(id) id,item_type itemType,bin_to_uuid(reference_id) referenceId,description,quantity,unit_price unitPrice,total
                from service_order_items where service_order_id=? order by description
                """,bytes(id)));
        return result;
    }

    @PostMapping("/api/v1/orders") @Transactional
    public Map<String,Object> createOrder(@Valid @RequestBody OrderRequest r){UUID id=UUID.randomUUID(),tid=tenant.tenantId();Instant now=Instant.now();jdbc.update("insert into service_orders(id,tenant_id,appointment_id,customer_id,employee_id,status,discount,total,notes,opened_at,updated_at) values(?,?,?,?,?,'OPEN',0,0,?,?,?)",bytes(id),bytes(tid),r.appointmentId()==null?null:bytes(r.appointmentId()),bytes(r.customerId()),r.employeeId()==null?null:bytes(r.employeeId()),r.notes(),Timestamp.from(now),Timestamp.from(now));return Map.of("id",id,"status","OPEN");}

    @PostMapping("/api/v1/orders/{id}/items") @Transactional
    public void addOrderItem(@PathVariable UUID id,@Valid @RequestBody OrderItemRequest r){UUID tid=tenant.tenantId();Long exists=count("select count(*) from service_orders where id=? and tenant_id=? and status='OPEN'",bytes(id),bytes(tid));if(exists==0)throw new NotFoundException("ORDER_NOT_FOUND","Comanda aberta não encontrada.");BigDecimal total=r.unitPrice().multiply(r.quantity());jdbc.update("insert into service_order_items(id,service_order_id,item_type,reference_id,description,quantity,unit_price,total) values(?,?,?,?,?,?,?,?)",bytes(UUID.randomUUID()),bytes(id),r.itemType(),r.referenceId()==null?null:bytes(r.referenceId()),r.description(),r.quantity(),r.unitPrice(),total);jdbc.update("update service_orders set total=(select coalesce(sum(total),0) from service_order_items where service_order_id=?)-discount,updated_at=? where id=?",bytes(id),Timestamp.from(Instant.now()),bytes(id));}

    @PostMapping("/api/v1/orders/{id}/close") @Transactional
    public void closeOrder(@PathVariable UUID id,@RequestBody CloseOrderRequest r){UUID tid=tenant.tenantId();int updated=jdbc.update("update service_orders set status='CLOSED',payment_method=?,closed_at=?,updated_at=? where id=? and tenant_id=? and status='OPEN'",r.paymentMethod(),Timestamp.from(Instant.now()),Timestamp.from(Instant.now()),bytes(id),bytes(tid));if(updated==0)throw new NotFoundException("ORDER_NOT_FOUND","Comanda aberta não encontrada.");BigDecimal total=decimal("select total from service_orders where id=?",bytes(id));jdbc.update("insert into financial_transactions(id,tenant_id,type,category,description,amount,occurred_on,status,created_at,updated_at) values(?,?,'INCOME','COMANDA','Recebimento de comanda',?,current_date,'PAID',?,?)",bytes(UUID.randomUUID()),bytes(tid),total,Timestamp.from(Instant.now()),Timestamp.from(Instant.now()));}

    @GetMapping("/api/v1/cash/current")
    public Map<String,Object> currentCash(){UUID tid=tenant.tenantId();var rows=jdbc.queryForList("select bin_to_uuid(id) id,status,opened_at openedAt,opening_balance openingBalance from cash_sessions where tenant_id=? and status='OPEN' order by opened_at desc limit 1",bytes(tid));if(rows.isEmpty())return Map.of("status","CLOSED");var result=new LinkedHashMap<String,Object>(rows.getFirst());BigDecimal income=decimal("select coalesce(sum(amount),0) from financial_transactions where tenant_id=? and type='INCOME' and status='PAID' and occurred_on=current_date",bytes(tid));BigDecimal expenses=decimal("select coalesce(sum(amount),0) from financial_transactions where tenant_id=? and type='EXPENSE' and status='PAID' and occurred_on=current_date",bytes(tid));BigDecimal opening=(BigDecimal)result.get("openingBalance");result.put("incomeToday",income);result.put("expensesToday",expenses);result.put("expectedBalance",opening.add(income).subtract(expenses));return result;}

    @PostMapping("/api/v1/cash/open") @Transactional
    public Map<String,Object> openCash(@RequestBody CashOpenRequest r){UUID tid=tenant.tenantId();if(count("select count(*) from cash_sessions where tenant_id=? and status='OPEN'",bytes(tid))>0)throw new ConflictException("CASH_ALREADY_OPEN","Já existe um caixa aberto.");UUID id=UUID.randomUUID();jdbc.update("insert into cash_sessions(id,tenant_id,opened_by,opened_at,opening_balance,status) values(?,?,?,?,?,'OPEN')",bytes(id),bytes(tid),bytes(tenant.userId()),Timestamp.from(Instant.now()),r.openingBalance());return Map.of("id",id,"status","OPEN");}

    @PostMapping("/api/v1/cash/{id}/close") @Transactional
    public void closeCash(@PathVariable UUID id,@RequestBody CashCloseRequest r){UUID tid=tenant.tenantId();BigDecimal movement=decimal("select coalesce(sum(case when type='INCOME' then amount else -amount end),0) from financial_transactions where tenant_id=? and status='PAID' and occurred_on=current_date",bytes(tid));BigDecimal opening=decimal("select opening_balance from cash_sessions where id=? and tenant_id=? and status='OPEN'",bytes(id),bytes(tid));int u=jdbc.update("update cash_sessions set status='CLOSED',closed_at=?,closing_balance=?,expected_balance=?,notes=? where id=? and tenant_id=? and status='OPEN'",Timestamp.from(Instant.now()),r.closingBalance(),opening.add(movement),r.notes(),bytes(id),bytes(tid));if(u==0)throw new NotFoundException("CASH_NOT_FOUND","Caixa aberto não encontrado.");}

    @GetMapping("/api/v1/notifications")
    public List<Map<String,Object>> notifications(){return jdbc.queryForList("select bin_to_uuid(id) id,channel,recipient,template,status,scheduled_at scheduledAt,sent_at sentAt,attempts from notification_outbox where tenant_id=? order by created_at desc limit 100",bytes(tenant.tenantId()));}

    @PostMapping("/api/v1/notifications/reminders") @Transactional
    public Map<String,Object> queueReminders(@RequestParam(defaultValue="24") int hours){UUID tid=tenant.tenantId();var appts=jdbc.queryForList("""
            select a.id,a.starts_at,c.phone,c.name customer_name,s.name service_name from appointments a join customers c on c.id=a.customer_id join services s on s.id=a.service_id
            where a.tenant_id=? and a.status in ('SCHEDULED','CONFIRMED') and a.starts_at between ? and ? and c.phone is not null
            """,bytes(tid),Timestamp.valueOf(LocalDateTime.now()),Timestamp.valueOf(LocalDateTime.now().plusHours(hours)));int queued=0;for(var a:appts){String phone=String.valueOf(a.get("phone"));String payload="Olá "+a.get("customer_name")+"! Lembrete do seu horário para "+a.get("service_name")+" em "+a.get("starts_at")+".";jdbc.update("insert into notification_outbox(id,tenant_id,channel,recipient,template,payload,status,scheduled_at,attempts,created_at) values(?,?,'WHATSAPP',?,'APPOINTMENT_REMINDER',?,'PENDING',?,0,?)",bytes(UUID.randomUUID()),bytes(tid),phone,payload,Timestamp.from(Instant.now()),Timestamp.from(Instant.now()));queued++;}return Map.of("queued",queued,"providerConfigured",false,"message","Mensagens adicionadas à fila. Configure um provedor WhatsApp para envio real.");}

    @PostMapping("/api/v1/assistant/query")
    public Map<String,Object> assistant(@RequestBody AssistantRequest r){String q=r.question().toLowerCase(Locale.ROOT);UUID tid=tenant.tenantId();if(q.contains("90")||q.contains("não volt")||q.contains("inativo")){var rows=jdbc.queryForList("""
            select bin_to_uuid(c.id) id,c.name,c.phone,max(a.starts_at) lastVisit from customers c left join appointments a on a.customer_id=c.id and a.status='COMPLETED'
            where c.tenant_id=? group by c.id,c.name,c.phone having max(a.starts_at) is null or max(a.starts_at)<date_sub(now(),interval 90 day) order by lastVisit
            """,bytes(tid));return Map.of("answer","Encontrei "+rows.size()+" clientes sem retorno há pelo menos 90 dias.","data",rows);}
        if(q.contains("cancel")){var rows=jdbc.queryForList("select e.name,count(*) total from appointments a join employees e on e.id=a.employee_id where a.tenant_id=? and a.status='CANCELLED' group by e.id,e.name order by total desc",bytes(tid));return Map.of("answer","Cancelamentos por profissional.","data",rows);}
        BigDecimal month=decimal("select coalesce(sum(price),0) from appointments where tenant_id=? and status='COMPLETED' and year(starts_at)=year(current_date) and month(starts_at)=month(current_date)",bytes(tid));return Map.of("answer","O faturamento concluído neste mês é R$ "+month+". Tente também: clientes sem retorno há 90 dias ou profissional com mais cancelamentos.","data",List.of());}

    @GetMapping("/api/v1/public-booking/settings")
    public Map<String,Object> publicBookingSettings(){var rows=jdbc.queryForList("select public_booking_enabled enabled,booking_slug slug,booking_message message from tenant_settings where tenant_id=?",bytes(tenant.tenantId()));return rows.isEmpty()?Map.of("enabled",false):rows.getFirst();}

    @PutMapping("/api/v1/public-booking/settings") @Transactional
    public Map<String,Object> updatePublicBookingSettings(@RequestBody PublicBookingSettingsRequest r){jdbc.update("update tenant_settings set public_booking_enabled=?,booking_slug=?,booking_message=?,updated_at=? where tenant_id=?",r.enabled(),r.slug(),r.message(),Timestamp.from(Instant.now()),bytes(tenant.tenantId()));return Map.of("enabled",r.enabled(),"slug",r.slug(),"message",r.message()==null?"":r.message());}

    @GetMapping("/api/public/{slug}")
    public Map<String,Object> publicCatalog(@PathVariable String slug){var settings=jdbc.queryForList("select tenant_id,business_name,phone,booking_message from tenant_settings where booking_slug=? and public_booking_enabled=true",slug);if(settings.isEmpty())throw new NotFoundException("PUBLIC_BOOKING_NOT_FOUND","Página pública não encontrada.");byte[] tid=(byte[])settings.getFirst().get("tenant_id");var services=jdbc.queryForList("select bin_to_uuid(id) id,name,description,duration_minutes durationMinutes,price,category from services where tenant_id=? and status='ACTIVE' order by name",tid);var employees=jdbc.queryForList("select bin_to_uuid(id) id,name,position,photo_url photoUrl from employees where tenant_id=? and status='ACTIVE' order by name",tid);return Map.of("business",settings.getFirst(),"services",services,"employees",employees);}

    @PostMapping("/api/public/{slug}/book") @Transactional
    public Map<String,Object> publicBook(@PathVariable String slug,@Valid @RequestBody PublicBookingRequest r){var settings=jdbc.queryForList("select tenant_id from tenant_settings where booking_slug=? and public_booking_enabled=true",slug);if(settings.isEmpty())throw new NotFoundException("PUBLIC_BOOKING_NOT_FOUND","Página pública não encontrada.");byte[] tid=(byte[])settings.getFirst().get("tenant_id");byte[] employee=bytes(r.employeeId()),service=bytes(r.serviceId());var serviceRows=jdbc.queryForList("select duration_minutes,price from services where id=? and tenant_id=? and status='ACTIVE'",service,tid);if(serviceRows.isEmpty())throw new NotFoundException("SERVICE_NOT_FOUND","Serviço não encontrado.");int duration=((Number)serviceRows.getFirst().get("duration_minutes")).intValue();BigDecimal price=(BigDecimal)serviceRows.getFirst().get("price");LocalDateTime end=r.startsAt().plusMinutes(duration);Long conflict=count("select count(*) from appointments where tenant_id=? and employee_id=? and status<>'CANCELLED' and starts_at<? and ends_at>?",tid,employee,Timestamp.valueOf(end),Timestamp.valueOf(r.startsAt()));if(conflict>0)throw new ConflictException("APPOINTMENT_CONFLICT","Horário indisponível.");var customers=jdbc.queryForList("select id from customers where tenant_id=? and phone=? limit 1",tid,r.phone());byte[] cid;if(customers.isEmpty()){UUID c=UUID.randomUUID();cid=bytes(c);Instant now=Instant.now();jdbc.update("insert into customers(id,tenant_id,name,email,phone,status,created_at,updated_at) values(?,?,?,?,?,'ACTIVE',?,?)",cid,tid,r.name(),r.email(),r.phone(),Timestamp.from(now),Timestamp.from(now));}else cid=(byte[])customers.getFirst().get("id");UUID aid=UUID.randomUUID();Instant now=Instant.now();jdbc.update("insert into appointments(id,tenant_id,customer_id,employee_id,service_id,starts_at,ends_at,status,notes,price,created_at,updated_at) values(?,?,?,?,?,?,?,'SCHEDULED',?,?,?,?)",bytes(aid),tid,cid,employee,service,Timestamp.valueOf(r.startsAt()),Timestamp.valueOf(end),"Agendamento online",price,Timestamp.from(now),Timestamp.from(now));return Map.of("id",aid,"status","SCHEDULED","startsAt",r.startsAt(),"endsAt",end);}

    private Long count(String sql,Object... args){Long v=jdbc.queryForObject(sql,Long.class,args);return v==null?0:v;}
    private BigDecimal decimal(String sql,Object... args){BigDecimal v=jdbc.queryForObject(sql,BigDecimal.class,args);return v==null?BigDecimal.ZERO:v;}
    private static byte[] bytes(UUID id){ByteBuffer b=ByteBuffer.allocate(16);b.putLong(id.getMostSignificantBits());b.putLong(id.getLeastSignificantBits());return b.array();}

    public record UnitRequest(@NotBlank String name,@NotBlank String slug,String address,String phone){}
    public record OrderRequest(@NotNull UUID customerId,UUID employeeId,UUID appointmentId,String notes){}
    public record OrderItemRequest(@NotBlank String itemType,UUID referenceId,@NotBlank String description,@NotNull @DecimalMin("0.01") BigDecimal quantity,@NotNull @DecimalMin("0.00") BigDecimal unitPrice){}
    public record CloseOrderRequest(@NotBlank String paymentMethod){}
    public record CashOpenRequest(@NotNull @DecimalMin("0.00") BigDecimal openingBalance){}
    public record CashCloseRequest(@NotNull @DecimalMin("0.00") BigDecimal closingBalance,String notes){}
    public record AssistantRequest(@NotBlank String question){}
    public record PublicBookingSettingsRequest(boolean enabled,@NotBlank String slug,String message){}
    public record PublicBookingRequest(@NotBlank String name,String email,@NotBlank String phone,@NotNull UUID employeeId,@NotNull UUID serviceId,@NotNull @Future LocalDateTime startsAt){}
}
