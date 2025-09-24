const  mongoose = require("mongoose")
const questionBankSchema =new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
   
    
    semesterID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Semester",
        required:true
    },
    subjectID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Subject",
        required:true
    },
    fileUrl: { type: String,
         required: true 
        }
    
  
    
})
const questionBank = mongoose.model('QuestionBank', questionBankSchema);
module.exports=questionBank
//"title":"2025qp","description":"2025 best resource","semesterID":"68b1670748687cfc8bce1630","subjectID":"68b16465af07931b1e23d7cc","fileUrl":"at somewhere"