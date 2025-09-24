const mongoose = require("mongoose")

const purchaseSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    bundleId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Bundle"
    }
    ,paymentDone: {
        type: Boolean,
        default: false
    }
    
})
const purchase = mongoose.model('purchase', purchaseSchema);
module.exports=purchase