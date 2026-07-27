CREATE TABLE services (
 id BINARY(16) NOT NULL PRIMARY KEY,
 tenant_id BINARY(16) NOT NULL,
 name VARCHAR(120) NOT NULL,
 description VARCHAR(1000) NULL,
 duration_minutes INT NOT NULL,
 price DECIMAL(12,2) NOT NULL,
 category VARCHAR(80) NULL,
 commission_percentage DECIMAL(5,2) NULL,
 status VARCHAR(20) NOT NULL,
 created_at TIMESTAMP(6) NOT NULL,
 updated_at TIMESTAMP(6) NOT NULL,
 CONSTRAINT uk_services_tenant_name UNIQUE (tenant_id, name),
 CONSTRAINT fk_services_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
CREATE INDEX idx_services_tenant_status ON services(tenant_id, status);
