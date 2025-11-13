const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 3000;

mongoose.connect("mongodb://localhost:27017/inventoryDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const CompanySchema = new mongoose.Schema({
  name: String,
});
const Company = mongoose.model("Company", CompanySchema);

const SupplierSchema = new mongoose.Schema({
  name: String,
  contact_email: String,
});
const Supplier = mongoose.model("Supplier", SupplierSchema);

const ProductSchema = new mongoose.Schema({
  name: String,
  sku: String,
  full_stock: Number,
  quantity: Number,
  warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" },
});
const Product = mongoose.model("Product", ProductSchema);

const WarehouseSchema = new mongoose.Schema({
  name: String,
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
});
const Warehouse = mongoose.model("Warehouse", WarehouseSchema);

app.get("/api/companies/:company_id/alerts/low-stock", async (req, res) => {
  try {
    const { company_id } = req.params;

    // Validate company
    const company = await Company.findById(company_id);
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Get warehouses for the company
    const warehouses = await Warehouse.find({ company_id }).populate("supplier_id");
    if (warehouses.length === 0) {
      return res.json({ alerts: [], total_alerts: 0 });
    }

    const alerts = [];

    //Loop through each warehouse
    for (const wh of warehouses) {
      const supplier = wh.supplier_id;

      // Fetch products for this warehouse
      const products = await Product.find({ warehouse_id: wh._id });

      // Check each product against 25% threshold
      for (const p of products) {
        const threshold = 0.25 * p.full_stock;
        if (p.quantity < threshold) {
          const avgDailySales = 2; // placeholder (later can compute from sales)
          const daysUntilStockout = Math.ceil(p.quantity / avgDailySales);

          alerts.push({
            product_id: p._id,
            product_name: p.name,
            sku: p.sku,
            warehouse_id: wh._id,
            warehouse_name: wh.name,
            current_stock: p.quantity,
            threshold: threshold,
            days_until_stockout: daysUntilStockout,
            supplier: supplier
              ? {
                  id: supplier._id,
                  name: supplier.name,
                  contact_email: supplier.contact_email,
                }
              : null,
          });
        }
      }
    }

    res.json({
      alerts,
      total_alerts: alerts.length,
    });
  } catch (err) {
    console.error("Error generating alerts:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
