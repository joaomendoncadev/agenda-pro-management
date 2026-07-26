package dev.joaomendonca.agendapro.employee.application;

import java.util.*;
import dev.joaomendonca.agendapro.employee.api.*;
import dev.joaomendonca.agendapro.employee.domain.*;
import dev.joaomendonca.agendapro.employee.infrastructure.*;
import dev.joaomendonca.agendapro.shared.exception.*;
import dev.joaomendonca.agendapro.shared.security.AuthenticatedTenantProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmployeeService {
 private final EmployeeRepository employees; private final EmployeeWorkScheduleRepository schedules; private final EmployeeBlockRepository blocks; private final AuthenticatedTenantProvider tenant;
 public EmployeeService(EmployeeRepository employees,EmployeeWorkScheduleRepository schedules,EmployeeBlockRepository blocks,AuthenticatedTenantProvider tenant){this.employees=employees;this.schedules=schedules;this.blocks=blocks;this.tenant=tenant;}
 @Transactional public EmployeeResponse create(EmployeeRequest r){UUID tid=tenant.tenantId();validateEmail(tid,r.email(),null);return EmployeeResponse.from(employees.save(new Employee(tid,r.name(),r.position(),r.email(),r.phone(),r.photoUrl())));}
 @Transactional(readOnly=true) public List<EmployeeResponse> list(){return employees.findAllByTenantIdOrderByName(tenant.tenantId()).stream().map(EmployeeResponse::from).toList();}
 @Transactional(readOnly=true) public EmployeeResponse get(UUID id){return EmployeeResponse.from(find(id));}
 @Transactional public EmployeeResponse update(UUID id,EmployeeRequest r){Employee e=find(id);validateEmail(e.getTenantId(),r.email(),id);e.update(r.name(),r.position(),r.email(),r.phone(),r.photoUrl());return EmployeeResponse.from(e);}
 @Transactional public EmployeeResponse changeStatus(UUID id,EmployeeStatusRequest r){Employee e=find(id);e.changeStatus(r.status());return EmployeeResponse.from(e);}
 @Transactional(readOnly=true) public List<WorkScheduleResponse> schedules(UUID employeeId){find(employeeId);return schedules.findAllByEmployeeIdOrderByDayOfWeek(employeeId).stream().map(WorkScheduleResponse::from).toList();}
 @Transactional public WorkScheduleResponse upsertSchedule(UUID employeeId,WorkScheduleRequest r){find(employeeId);try{EmployeeWorkSchedule s=schedules.findByEmployeeIdAndDayOfWeek(employeeId,r.dayOfWeek()).orElseGet(()->new EmployeeWorkSchedule(employeeId,r.dayOfWeek(),r.working(),r.startTime(),r.endTime(),r.breakStart(),r.breakEnd()));if(s.getId()!=null && schedules.existsById(s.getId()))s.update(r.working(),r.startTime(),r.endTime(),r.breakStart(),r.breakEnd());return WorkScheduleResponse.from(schedules.save(s));}catch(IllegalArgumentException ex){throw new DomainException("INVALID_WORK_SCHEDULE",ex.getMessage());}}
 @Transactional(readOnly=true) public List<BlockResponse> blocks(UUID employeeId){find(employeeId);return blocks.findAllByEmployeeIdOrderByStartsAt(employeeId).stream().map(BlockResponse::from).toList();}
 @Transactional public BlockResponse createBlock(UUID employeeId,BlockRequest r){find(employeeId);try{return BlockResponse.from(blocks.save(new EmployeeBlock(employeeId,r.startsAt(),r.endsAt(),r.reason())));}catch(IllegalArgumentException ex){throw new DomainException("INVALID_BLOCK_PERIOD",ex.getMessage());}}
 @Transactional public void deleteBlock(UUID employeeId,UUID blockId){find(employeeId);EmployeeBlock b=blocks.findByIdAndEmployeeId(blockId,employeeId).orElseThrow(()->new NotFoundException("EMPLOYEE_BLOCK_NOT_FOUND","Bloqueio não encontrado."));blocks.delete(b);}
 private Employee find(UUID id){return employees.findByIdAndTenantId(id,tenant.tenantId()).orElseThrow(()->new NotFoundException("EMPLOYEE_NOT_FOUND","Funcionário não encontrado."));}
 private void validateEmail(UUID tenantId,String email,UUID id){if(email==null||email.isBlank())return;boolean exists=id==null?employees.existsByTenantIdAndEmailIgnoreCase(tenantId,email):employees.existsByTenantIdAndEmailIgnoreCaseAndIdNot(tenantId,email,id);if(exists)throw new ConflictException("EMPLOYEE_EMAIL_ALREADY_EXISTS","Já existe um funcionário com este e-mail.");}
}
