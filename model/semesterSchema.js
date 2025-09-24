const mongoose = require("mongoose")
const semesterSchema = new mongoose.Schema({
    semester:{
        type:String,
        unique:true,
        required:true
    }
    
})
const Semester = mongoose.model('Semester', semesterSchema);
module.exports=Semester