CREATE TABLE products (
  id BINARY(16) PRIMARY KEY,
  tenant_id BINARY(16) NOT NULL,
  name VARCHAR(160) NOT NULL,
  sku VARCHAR(80),
  category VARCHAR(100),
  sale_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  cost_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  stock_quantity DECIMAL(12,2) NOT NULL DEFAULT 0,
  minimum_stock DECIMAL(12,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP(6) NOT NULL,
  updated_at TIMESTAMP(6) NOT NULL,
  CONSTRAINT uk_products_tenant_sku UNIQUE (tenant_id, sku),
  INDEX idx_products_tenant_active (tenant_id, active),
  INDEX idx_products_tenant_name (tenant_id, name)
);

CREATE TABLE inventory_movements (
  id BINARY(16) PRIMARY KEY,
  tenant_id BINARY(16) NOT NULL,
  product_id BINARY(16) NOT NULL,
  movement_type VARCHAR(20) NOT NULL,
  quantity DECIMAL(12,2) NOT NULL,
  unit_cost DECIMAL(12,2),
  reason VARCHAR(255) NOT NULL,
  occurred_at TIMESTAMP(6) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL,
  CONSTRAINT fk_inventory_movement_product FOREIGN KEY (product_id) REFERENCES products(id),
  INDEX idx_inventory_movements_tenant_date (tenant_id, occurred_at),
  INDEX idx_inventory_movements_product (product_id, occurred_at)
);

CREATE TABLE commission_entries (
  id BINARY(16) PRIMARY KEY,
  tenant_id BINARY(16) NOT NULL,
  employee_id BINARY(16) NOT NULL,
  order_id BINARY(16),
  description VARCHAR(180) NOT NULL,
  base_amount DECIMAL(12,2) NOT NULL,
  percentage DECIMAL(6,2) NOT NULL,
  commission_amount DECIMAL(12,2) NOT NULL,
  occurred_on DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  paid_at TIMESTAMP(6),
  created_at TIMESTAMP(6) NOT NULL,
  INDEX idx_commissions_tenant_period (tenant_id, occurred_on, status),
  INDEX idx_commissions_employee (employee_id, occurred_on)
);
