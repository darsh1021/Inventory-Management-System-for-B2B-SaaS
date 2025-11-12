const mongoose = require('mongoose');
const InventorySchema = mongoose.Schema({

    product_id:
    {
        type:String,
        required:true
    },
    warehouse_id:
    {
        type:String,
        required:true
    },
    quantity:
    {
        type:String,
        required:true
    }

});

const Inventory = mongoose.model('Inventory',InventorySchema);
module.exports = Inventory;