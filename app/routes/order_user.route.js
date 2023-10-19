const express = require("express");

const order = require("../controllers/order.controller");
// const service = require("../controllers/serviceProvider.controller")

const router = express.Router();

router.route("/").get(order.findAllOrderOfUser).post(order.addOrder);

router.route("/cancel/:email/:id").post(order.orderUserCancel);
router.route("/cancel/:email/:id").get(order.orderUserCancel);
//USER CANCEL
router.route("/cancel/:orderId").put(order.cancelOrderByUser);

//CHOOSE PAYMENT METHOD
router.route("/choosePayment").post(order.paymentWithUser);

router.route("/:orderId").get(order.findOneOrder);

// router.route("/cancelOrder/:orderId").get(order.cancelOrderUser);

// router.route("/getOrder").get(order.getOrderUnconfirm);

// // .delete(order.deleteAll)

// router.route("/allOrder").get(order.findAllOrders);

// router.route("/cancel/:userId/:orderId").get(order.cancelOrder);

// router.route("/accept/:userId/:orderId").get(order.acceptOrder);

// router
//   .route("findOne/:id")
//   // .get(service.findOneService)
//   .get(order.findOneOrder);

module.exports = router;
