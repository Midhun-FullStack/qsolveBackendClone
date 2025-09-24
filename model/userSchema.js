const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    username:{
        type:String,
        
        required:true
    },
    email:{
        type:String,
        
        required:true

    },
    password:{
        type:String,
        required: true 
        
    },
    firstname:{
        type:String,
        
    },
    lastname:{
        type:String,
        
    },
    role: { 
    type: String, 
    enum: ['student', 'staff', "other","admin"], 
    
  }
})
const User = mongoose.model('User', userSchema);
module.exports=User