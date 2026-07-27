CREATE TABLE business_units (
  id BINARY(16) PRIMARY KEY,
  tenant_id BINARY(16) NOT NULL,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(80) NOT NULL,
  address VARCHAR(255),
  phone VARCHAR(40),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP(6) NOT NULL,
  updated_at TIMESTAMP(6) NOT NULL,
  CONSTRAINT uk_business_units_tenant_slug UNIQUE (tenant_id, slug),
  INDEX idx_business_units_tenant (tenant_id, active)
);

CREATE TABLE service_orders (
  id BINARY(16) PRIMARY KEY,
  tenant_id BINARY(16) NOT NULL,
  appointment_id BINARY(16),
  customer_id BINARY(16) NOT NULL,
  employee_id BINARY(16),
  status VARCHAR(20) NOT NULL,
  discount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(30),
  notes VARCHAR(1000),
  opened_at TIMESTAMP(6) NOT NULL,
  closed_at TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL,
  INDEX idx_service_orders_tenant_status (tenant_id, status),
  INDEX idx_service_orders_customer (tenant_id, customer_id)
);

CREATE TABLE service_order_items (
  id BINARY(16) PRIMARY KEY,
  service_order_id BINARY(16) NOT NULL,
  item_type VARCHAR(20) NOT NULL,
  reference_id BINARY(16),
  description VARCHAR(180) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (service_order_id) REFERENCES service_orders(id) ON DELETE CASCADE,
  INDEX idx_order_items_order (service_order_id)
);

CREATE TABLE cash_sessions (
  id BINARY(16) PRIMARY KEY,
  tenant_id BINARY(16) NOT NULL,
  opened_by BINARY(16) NOT NULL,
  opened_at TIMESTAMP(6) NOT NULL,
  opening_balance DECIMAL(12,2) NOT NULL,
  closed_at TIMESTAMP(6),
  closing_balance DECIMAL(12,2),
  expected_balance DECIMAL(12,2),
  notes VARCHAR(500),
  status VARCHAR(20) NOT NULL,
  INDEX idx_cash_sessions_tenant_status (tenant_id, status)
);

CREATE TABLE notification_outbox (
  id BINARY(16) PRIMARY KEY,
  tenant_id BINARY(16) NOT NULL,
  channel VARCHAR(20) NOT NULL,
  recipient VARCHAR(100) NOT NULL,
  template VARCHAR(80) NOT NULL,
  payload TEXT NOT NULL,
  status VARCHAR(20) NOT NULL,
  scheduled_at TIMESTAMP(6) NOT NULL,
  sent_at TIMESTAMP(6),
  attempts INT NOT NULL DEFAULT 0,
  last_error VARCHAR(500),
  created_at TIMESTAMP(6) NOT NULL,
  INDEX idx_notification_outbox_status (status, scheduled_at)
);

ALTER TABLE tenant_settings ADD COLUMN public_booking_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE tenant_settings ADD COLUMN booking_slug VARCHAR(80) NULL;
ALTER TABLE tenant_settings ADD COLUMN booking_message VARCHAR(255) NULL;
ALTER TABLE tenant_settings ADD CONSTRAINT uk_tenant_settings_booking_slug UNIQUE (booking_slug);
