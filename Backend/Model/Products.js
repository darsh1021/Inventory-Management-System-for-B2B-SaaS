const mongoose = require('mongoose');
const ProductSchema = mongoose.Schema({

    name:
    {
        type:String,
        required:true
    },
    warehouse_id:
    {
        type:String,
        required:true
    },
    sku:
    {
        type:String,
        required:true
    },
    price:
    {
        type:String,
        required:true
    }

});

const Product = mongoose.model('Product',ProductSchema);
module.exports = Product;