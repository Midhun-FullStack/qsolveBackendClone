const { confirmPayment, createPaymentIntent } = require("../../controller/paymentController");
const { authenticateUser } = require("../../middleware/auth");
const express = require("express")
router = express.Router()

router.post("/create-payment-intent", authenticateUser, createPaymentIntent);
router.post("/confirm-payment", authenticateUser, confirmPayment);

module.exports = router
