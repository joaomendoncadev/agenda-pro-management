CREATE TABLE customers (
    id BINARY(16) NOT NULL,
    tenant_id BINARY(16) NOT NULL,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(180) NULL,
    phone VARCHAR(30) NULL,
    birth_date DATE NULL,
    notes VARCHAR(2000) NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_customers_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT uk_customers_tenant_email UNIQUE (tenant_id, email),
    INDEX idx_customers_tenant_name (tenant_id, name),
    INDEX idx_customers_tenant_phone (tenant_id, phone),
    INDEX idx_customers_tenant_status (tenant_id, status),
    INDEX idx_customers_tenant_birth_date (tenant_id, birth_date)
);
