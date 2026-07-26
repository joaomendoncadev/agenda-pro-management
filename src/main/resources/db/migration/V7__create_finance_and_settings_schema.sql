CREATE TABLE financial_transactions (
 id BINARY(16) NOT NULL PRIMARY KEY,
 tenant_id BINARY(16) NOT NULL,
 appointment_id BINARY(16) NULL,
 type VARCHAR(20) NOT NULL,
 category VARCHAR(80) NOT NULL,
 description VARCHAR(255) NOT NULL,
 amount DECIMAL(12,2) NOT NULL,
 occurred_on DATE NOT NULL,
 status VARCHAR(20) NOT NULL,
 created_at TIMESTAMP(6) NOT NULL,
 updated_at TIMESTAMP(6) NOT NULL,
 CONSTRAINT fk_financial_transactions_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
 CONSTRAINT fk_financial_transactions_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);
CREATE INDEX idx_finance_tenant_date ON financial_transactions(tenant_id, occurred_on);
CREATE INDEX idx_finance_tenant_type ON financial_transactions(tenant_id, type);

CREATE TABLE tenant_settings (
 tenant_id BINARY(16) NOT NULL PRIMARY KEY,
 business_name VARCHAR(120) NOT NULL,
 phone VARCHAR(30) NULL,
 timezone VARCHAR(60) NOT NULL DEFAULT 'America/Sao_Paulo',
 currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
 booking_interval_minutes INT NOT NULL DEFAULT 30,
 cancellation_hours INT NOT NULL DEFAULT 24,
 created_at TIMESTAMP(6) NOT NULL,
 updated_at TIMESTAMP(6) NOT NULL,
 CONSTRAINT fk_tenant_settings_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE subscriptions (
 id BINARY(16) NOT NULL PRIMARY KEY,
 tenant_id BINARY(16) NOT NULL,
 plan VARCHAR(30) NOT NULL,
 status VARCHAR(30) NOT NULL,
 trial_ends_at TIMESTAMP(6) NULL,
 current_period_ends_at TIMESTAMP(6) NULL,
 provider VARCHAR(30) NULL,
 external_customer_id VARCHAR(120) NULL,
 external_subscription_id VARCHAR(120) NULL,
 created_at TIMESTAMP(6) NOT NULL,
 updated_at TIMESTAMP(6) NOT NULL,
 CONSTRAINT uk_subscriptions_tenant UNIQUE (tenant_id),
 CONSTRAINT fk_subscriptions_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
