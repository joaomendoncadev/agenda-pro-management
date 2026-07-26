package dev.joaomendonca.agendapro.customer.application;

import java.util.*;
import dev.joaomendonca.agendapro.customer.api.*;
import dev.joaomendonca.agendapro.customer.domain.*;
import dev.joaomendonca.agendapro.customer.infrastructure.CustomerRepository;
import dev.joaomendonca.agendapro.shared.exception.*;
import dev.joaomendonca.agendapro.shared.security.AuthenticatedTenantProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerService {
 private final CustomerRepository customers; private final AuthenticatedTenantProvider tenant;
 public CustomerService(CustomerRepository customers,AuthenticatedTenantProvider tenant){this.customers=customers;this.tenant=tenant;}
 @Transactional public CustomerResponse create(CustomerRequest r){UUID tid=tenant.tenantId();validateEmail(tid,r.email(),null);return CustomerResponse.from(customers.save(new Customer(tid,r.name(),r.email(),r.phone(),r.birthDate(),r.notes())));}
 @Transactional(readOnly=true) public List<CustomerResponse> list(){return customers.findAllByTenantIdOrderByName(tenant.tenantId()).stream().map(CustomerResponse::from).toList();}
 @Transactional(readOnly=true) public CustomerResponse get(UUID id){return CustomerResponse.from(find(id));}
 @Transactional public CustomerResponse update(UUID id,CustomerRequest r){Customer c=find(id);validateEmail(c.getTenantId(),r.email(),id);c.update(r.name(),r.email(),r.phone(),r.birthDate(),r.notes());return CustomerResponse.from(c);}
 @Transactional public CustomerResponse changeStatus(UUID id,CustomerStatusRequest r){Customer c=find(id);c.changeStatus(r.status());return CustomerResponse.from(c);}
 private Customer find(UUID id){return customers.findByIdAndTenantId(id,tenant.tenantId()).orElseThrow(()->new NotFoundException("CUSTOMER_NOT_FOUND","Cliente não encontrado."));}
 private void validateEmail(UUID tenantId,String email,UUID id){if(email==null||email.isBlank())return;boolean exists=id==null?customers.existsByTenantIdAndEmailIgnoreCase(tenantId,email):customers.existsByTenantIdAndEmailIgnoreCaseAndIdNot(tenantId,email,id);if(exists)throw new ConflictException("CUSTOMER_EMAIL_ALREADY_EXISTS","Já existe um cliente com este e-mail.");}
}
