const mongoose = require("mongoose")
const BundleSchema = new mongoose.Schema({
    title:{
        type:String
    },
    departmentID:{

        type:mongoose.Schema.Types.ObjectId,
        ref:"departmentSchema",
        required:true



    },
     price:{
            type:Number,
            required:true,
            min:0
        },
     products:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"QuestionBank"
         
    }]
    
})
const Bundle = mongoose.model('Bundle', BundleSchema);
module.exports=Bundle