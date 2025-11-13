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
</br>
<h1>Part 2: Database Design</h1>
<b>Database Schema </b>
<br></br>
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
<br>
<b>To identify gaps questions for Product Team</b>
<ol>
  <li>Do we need to track who created/updated products or warehouses?</li>
  <li>Do warehouses have capacity limits we need to track?</li>
  <li>When selling a bundle, should inventory of individual products automatically decrease?</li>
  <li>who will do what? RBA-Role based access</li>
</ol>
<br>
<b> Decision Choices </b>
<ul>
  <li>Timestamps with CURRENT_TIMESTAMP — automatically record when each record was created or updated.</li>
  <li>product_bundle_items table — allows defining bundles that contain multiple products or items.</li>
  <li>inventory_history table — maintains a log of every stock change for audit and reporting purposes.</li>
  <li>inventory table has a unique combination of (product_id, warehouse_id) — prevents duplicate entries for the same product in the same warehouse.</li>
  <li>Price stored as DECIMAL(10,2) — avoids rounding errors and preserves financial accuracy.</li>
  <li>CHECK constraints on quantity and price — ensures only valid, non-negative values are stored.</li>
  <li>Primary keys use SERIAL — ensures each record has a unique, auto-incremented ID for easy referencing.</li>
</ul>
<br>
<h1>Part 3: API Implementation</h1>
The code is provided in part3
all assumed 
</br>
