package dev.joaomendonca.agendapro.customer.api;
import java.net.URI;import java.util.*;
import dev.joaomendonca.agendapro.customer.application.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.*;import org.springframework.security.access.prepost.PreAuthorize;import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/customers") @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
public class CustomerController {
 private final CustomerService service;public CustomerController(CustomerService service){this.service=service;}
 @PostMapping public ResponseEntity<CustomerResponse> create(@Valid @RequestBody CustomerRequest r){CustomerResponse c=service.create(r);return ResponseEntity.created(URI.create("/api/v1/customers/"+c.id())).body(c);}
 @GetMapping public List<CustomerResponse> list(){return service.list();}
 @GetMapping("/{id}") public CustomerResponse get(@PathVariable UUID id){return service.get(id);}
 @PutMapping("/{id}") public CustomerResponse update(@PathVariable UUID id,@Valid @RequestBody CustomerRequest r){return service.update(id,r);}
 @PatchMapping("/{id}/status") public CustomerResponse status(@PathVariable UUID id,@Valid @RequestBody CustomerStatusRequest r){return service.changeStatus(id,r);}
}
