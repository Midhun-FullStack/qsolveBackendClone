const mongoose = require("mongoose")
const subjectSchema = new mongoose.Schema({
    subject:{
        type:String,
        unique:true,
        required:true
    }
    
})
const Subject = mongoose.model('Subject', subjectSchema);
module.exports=Subject