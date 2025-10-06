
const asynchandler = require("express-async-handler")
const purchase = require("../model/purchaseSchema")
const stripe = require("../config/stripe")
const Bundle = require("../model/BundleShcema")

exports.createPaymentIntent = asynchandler(async (req, res) => {
    const { bundleId } = req.body
    const userId = req.user._id

    if (!bundleId) {
        return res.status(400).json({ error: "Bundle ID is required" })
    }

    // Check if bundle exists
    const bundle = await Bundle.findById(bundleId)
    if (!bundle) {
        return res.status(404).json({ error: "Bundle not found" })
    }

    // Check if user already purchased this bundle
    const existingPurchase = await purchase.findOne({ userId, bundleId })
    if (existingPurchase && existingPurchase.paymentDone) {
        return res.status(400).json({ error: "Bundle already purchased" })
    }

    // Create or update purchase record
    const purchaseRecord = await purchase.findOneAndUpdate(
        { userId, bundleId },
        { userId, bundleId, paymentDone: false },
        { upsert: true, new: true }
    )

    // For dummy payment, return a dummy clientSecret
    if (!stripe) {
        res.status(200).json({
            clientSecret: 'dummy_client_secret_' + purchaseRecord._id,
            purchaseId: purchaseRecord._id
        })
        return
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(bundle.price * 100), // Convert to cents
        currency: 'usd',
        metadata: {
            purchaseId: purchaseRecord._id.toString(),
            bundleId: bundleId,
            userId: userId.toString()
        }
    })

    res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        purchaseId: purchaseRecord._id
    })
})

exports.confirmPayment=asynchandler(async(req,res)=>{
  const {payment,bundleId}=req.body
  if(!payment){
    return res.status(400).json({error:"payment not succesfull"})
  }
  await purchase.findOneAndUpdate({
    userId:req.user._id,bundleId
  },{paymentDone:true})
  res.status(200).json({message:"payment confirmed"})
})
