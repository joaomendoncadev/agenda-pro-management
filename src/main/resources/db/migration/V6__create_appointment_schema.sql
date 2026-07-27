CREATE TABLE appointments (
 id BINARY(16) NOT NULL PRIMARY KEY,
 tenant_id BINARY(16) NOT NULL,
 customer_id BINARY(16) NOT NULL,
 employee_id BINARY(16) NOT NULL,
 service_id BINARY(16) NOT NULL,
 starts_at DATETIME(6) NOT NULL,
 ends_at DATETIME(6) NOT NULL,
 status VARCHAR(20) NOT NULL,
 notes VARCHAR(1000) NULL,
 price DECIMAL(12,2) NOT NULL,
 created_at TIMESTAMP(6) NOT NULL,
 updated_at TIMESTAMP(6) NOT NULL,
 CONSTRAINT fk_appointments_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
 CONSTRAINT fk_appointments_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
 CONSTRAINT fk_appointments_employee FOREIGN KEY (employee_id) REFERENCES employees(id),
 CONSTRAINT fk_appointments_service FOREIGN KEY (service_id) REFERENCES services(id)
);
CREATE INDEX idx_appointments_tenant_start ON appointments(tenant_id, starts_at);
CREATE INDEX idx_appointments_employee_period ON appointments(tenant_id, employee_id, starts_at, ends_at);
