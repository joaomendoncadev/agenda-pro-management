package dev.joaomendonca.agendapro.employee.api;
import java.net.URI;import java.util.*;
import dev.joaomendonca.agendapro.employee.application.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.http.*;import org.springframework.security.access.prepost.PreAuthorize;import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/employees") @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
public class EmployeeController {
 private final EmployeeService service;public EmployeeController(EmployeeService service){this.service=service;}
 @PostMapping public ResponseEntity<EmployeeResponse> create(@Valid @RequestBody EmployeeRequest r){EmployeeResponse e=service.create(r);return ResponseEntity.created(URI.create("/api/v1/employees/"+e.id())).body(e);}
 @GetMapping public List<EmployeeResponse> list(){return service.list();}
 @GetMapping("/{id}") public EmployeeResponse get(@PathVariable UUID id){return service.get(id);}
 @PutMapping("/{id}") public EmployeeResponse update(@PathVariable UUID id,@Valid @RequestBody EmployeeRequest r){return service.update(id,r);}
 @PatchMapping("/{id}/status") public EmployeeResponse status(@PathVariable UUID id,@Valid @RequestBody EmployeeStatusRequest r){return service.changeStatus(id,r);}
 @GetMapping("/{id}/work-schedules") public List<WorkScheduleResponse> schedules(@PathVariable UUID id){return service.schedules(id);}
 @PutMapping("/{id}/work-schedules") public WorkScheduleResponse schedule(@PathVariable UUID id,@Valid @RequestBody WorkScheduleRequest r){return service.upsertSchedule(id,r);}
 @GetMapping("/{id}/blocks") public List<BlockResponse> blocks(@PathVariable UUID id){return service.blocks(id);}
 @PostMapping("/{id}/blocks") public ResponseEntity<BlockResponse> block(@PathVariable UUID id,@Valid @RequestBody BlockRequest r){BlockResponse b=service.createBlock(id,r);return ResponseEntity.status(HttpStatus.CREATED).body(b);}
 @DeleteMapping("/{id}/blocks/{blockId}") @ResponseStatus(HttpStatus.NO_CONTENT) public void deleteBlock(@PathVariable UUID id,@PathVariable UUID blockId){service.deleteBlock(id,blockId);}
}
