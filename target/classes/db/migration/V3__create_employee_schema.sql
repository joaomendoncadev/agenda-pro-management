CREATE TABLE employees (
 id BINARY(16) NOT NULL, tenant_id BINARY(16) NOT NULL, name VARCHAR(120) NOT NULL,
 position VARCHAR(120) NOT NULL, email VARCHAR(180) NULL, phone VARCHAR(30) NULL,
 photo_url VARCHAR(500) NULL, status VARCHAR(20) NOT NULL,
 created_at TIMESTAMP(6) NOT NULL, updated_at TIMESTAMP(6) NOT NULL,
 CONSTRAINT pk_employees PRIMARY KEY (id),
 CONSTRAINT fk_employees_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
 CONSTRAINT uk_employees_tenant_email UNIQUE (tenant_id,email)
);
CREATE INDEX idx_employees_tenant_status ON employees(tenant_id,status);

CREATE TABLE employee_work_schedules (
 id BINARY(16) NOT NULL, employee_id BINARY(16) NOT NULL, day_of_week VARCHAR(12) NOT NULL,
 start_time TIME NULL, end_time TIME NULL, break_start TIME NULL, break_end TIME NULL, working BOOLEAN NOT NULL,
 CONSTRAINT pk_employee_work_schedules PRIMARY KEY(id),
 CONSTRAINT fk_employee_schedule_employee FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE,
 CONSTRAINT uk_employee_schedule_day UNIQUE(employee_id,day_of_week)
);

CREATE TABLE employee_blocks (
 id BINARY(16) NOT NULL, employee_id BINARY(16) NOT NULL, starts_at TIMESTAMP(6) NOT NULL,
 ends_at TIMESTAMP(6) NOT NULL, reason VARCHAR(200) NOT NULL, created_at TIMESTAMP(6) NOT NULL,
 CONSTRAINT pk_employee_blocks PRIMARY KEY(id),
 CONSTRAINT fk_employee_blocks_employee FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
);
CREATE INDEX idx_employee_blocks_period ON employee_blocks(employee_id,starts_at,ends_at);
