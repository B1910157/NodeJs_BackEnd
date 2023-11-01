const express = require("express");

const payment = require("../controllers/stripe.controller");
const vnPay = require("../controllers/vnPay.controller");
// const service = require("../controllers/serviceProvider.controller")
// const user = require("../controllers/user.controller")

const router = express.Router();

//get customer
router.route("/getCustomer").get(payment.getCustomerByEmail);

router.route("/").post(payment.create_payment);

router.route("/getOne/:idPayment").get(payment.getOnePaymentById);
router.route("/getAll").get(payment.getAllSuccessfulPayments);
router.route("/addMoney").post(payment.addFundsToCustomer);

//create session stripe
router.route("/createSession").post(payment.createSession);

//VN PAY
router.route("/vnPay").post(vnPay.create_vnPayment);

module.exports = router;
