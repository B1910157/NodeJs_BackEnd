const express = require("express");

const payment = require("../controllers/stripe.controller");
const vnPay = require("../controllers/vnPay.controller");
// const service = require("../controllers/serviceProvider.controller")
// const user = require("../controllers/user.controller")

const router = express.Router();

router.route("/").post(payment.create_payment);
router.route("/getOne/:idPayment").get(payment.getOnePaymentById);
router.route("/getAll").get(payment.getAllSuccessfulPayments);
router.route("/addMoney").post(payment.addFundsToCustomer);

//VN PAY
router.route("/vnPay").post(vnPay.create_vnPayment);

module.exports = router;
