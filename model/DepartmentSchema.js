const mongoose = require("mongoose")
const departmentSchema = new mongoose.Schema({
    department:{
        type:String,
        
        required:true
    }
    
})
const department = mongoose.model('departmentSchema', departmentSchema);
module.exports=department