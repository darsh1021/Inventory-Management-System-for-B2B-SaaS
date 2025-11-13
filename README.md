<h1>Part 1: Code Review & Debugging</h1>
<p>
  <b>Identified Issues And Empacts</b>
<ul>
<li>No SKU uniqueness check ,Can create duplicate products with same SKU, causing data conflicts.</li>
</li>Multiple commits without transaction ,If second commit fails, product is saved but inventory isn’t.</li>
</li>Product linked to only one warehouse ,Violates business rule that products can exist in multiple warehouses.</li>
</li>No validation or error handling ,Missing fields or wrong data can crash the API or corrupt the database.</li>
</ul>
<p>

<h1>Part 2: Database Design</h1>
<code> 
--1. Companies
CREATE TABLE companies (
    company_id       SERIAL PRIMARY KEY,
    name             VARCHAR(100) NOT NULL UNIQUE,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Warehouses
CREATE TABLE warehouses (
    warehouse_id     SERIAL PRIMARY KEY,
    company_id       INT NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
    name             VARCHAR(100) NOT NULL,
    location         VARCHAR(150),
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Suppliers
CREATE TABLE suppliers (
    supplier_id      SERIAL PRIMARY KEY,
    name             VARCHAR(100) NOT NULL,
    contact_email    VARCHAR(100),
    phone_number     VARCHAR(20),
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Products
CREATE TABLE products (
    product_id       SERIAL PRIMARY KEY,
    supplier_id      INT REFERENCES suppliers(supplier_id) ON DELETE SET NULL,
    sku              VARCHAR(50) UNIQUE NOT NULL,
    name             VARCHAR(100) NOT NULL,
    price            DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    is_bundle        BOOLEAN DEFAULT FALSE,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Product Bundles
CREATE TABLE product_bundle_items (
    bundle_id        INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    item_id          INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    quantity         INT NOT NULL CHECK (quantity > 0),
    PRIMARY KEY (bundle_id, item_id)
);

-- 6. Inventory
CREATE TABLE inventory (
    inventory_id     SERIAL PRIMARY KEY,
    product_id       INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    warehouse_id     INT NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE CASCADE,
    quantity         INT NOT NULL CHECK (quantity >= 0),
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (product_id, warehouse_id)
);

-- 7. Inventory History 
CREATE TABLE inventory_history (
    history_id       SERIAL PRIMARY KEY,
    inventory_id     INT NOT NULL REFERENCES inventory(inventory_id) ON DELETE CASCADE,
    change_type      VARCHAR(20) NOT NULL CHECK (change_type IN ('INCREASE', 'DECREASE', 'ADJUSTMENT')),
    quantity_changed INT NOT NULL,
    reason           TEXT,
    changed_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
</code>
