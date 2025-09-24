const mongoose = require("mongoose")
const degreeCatlogSchema = new mongoose.Schema({
    degreeCatlog:{
        type:String,
        unique:true,
        required:true
    }
    
})
const degreeCatlog = mongoose.model('degreeCatlogSchema', degreeCatlogSchema);
module.exports=degreeCatlog