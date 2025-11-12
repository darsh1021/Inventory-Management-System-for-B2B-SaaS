const  express  = require('express');
require('./Database/db');
const Inventory  = require('./Model/Inventory');
const Product = require('./Model/Products');
const cors =require("cors");

const  app = express();
const port = 3000;
app.use(express.json());

app.use(cors());
app.listen(port , ()=>{console.log("Example app listening")});

app.post('/api/products', async (req, res) => {
  try {
    const data = req.body;
    //console.log(data);

    const product = new Product({
      name: data.name,
      sku: data.sku,
      price: data.price,
      warehouse_id: data.warehouse_id
    });

    await product.save();
    
    const inventory = new Inventory({
      product_id: product._id,
      warehouse_id: data.warehouse_id,
      quantity: data.initial_quantity
    });

    await inventory.save();

    res.json({
      message: "Product created",
      product_id: product._id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create product" });
  }
});
