
const asynchandler = require("express-async-handler")
const purchase = require("../model/purchaseSchema")


exports.confirmPayment=asynchandler(async(req,res)=>{
  const {payment,bundleId}=req.body
  if(!payment){
    res.status(400).json({error:"payment not succesfull"})
  }
  await purchase.findOneAndUpdate({
    userId:req.User,bundleId
  },{paymentDone:true})
  res.status(200).json({message:"payment confirmed"})
})