const express = require("express");

const order = require("../controllers/order.controller");
// const service = require("../controllers/serviceProvider.controller")

const router = express.Router();

router.route("/").get(order.findAllOrderOfService);
router.route("/findOrderByMonth").get(order.findAllOrderOfServiceByMonth);
router.route("/findOrdersSuccess").get(order.findAllOrderOfServiceSuccess);
router.route("/:orderId").get(order.findOneOrderOfService);

router.route("/findOrdersByDate").post(order.filterOrderByDate);

//SURCHARGES
router.route("/surcharges").post(order.surcharges);
router.route("/reSendMail/:orderId").get(order.reSendMail);
//ACCEPT
router.route("/accept/:orderId").put(order.acceptOrder);
//ADMIN CANCEL
router.route("/cancel/:orderId").put(order.cancelOrder);

//UPDATE ORDER
router
  .route("/addFoodToCartInOrder/:orderId/:foodId")
  .get(order.addFoodToCartInOrder);
router
  .route("/removeFoodInOrder/:orderId/:foodId")
  .delete(order.removeFoodInOrder);

router
  .route("/order/findFoodNotInOrder/:orderId")
  .get(order.findFoodNotInOrder);

//Drink
router
  .route("/order/findDrinkNotInOrder/:orderId")
  .get(order.findDrinkNotInOrder);
router
  .route("/:orderId/addOrUpdateDrink")
  .put(order.addOrUpdateDrinkInCartOfOrder);

router
  .route("/removeDrinkInOrder/:orderId/:drinkId")
  .delete(order.removeDrinkInOrder);

//OTHER
router
  .route("/addOtherToCartInOrder/:orderId/:otherId")
  .get(order.addOtherToCartInOrder);
router
  .route("/order/findOtherNotInOrder/:orderId")
  .get(order.findOtherNotInOrder);
router
  .route("/removeOtherInOrder/:orderId/:otherId")
  .delete(order.removeOtherInOrder);

// update info party
router.route("/updateInfoParty/:orderId").post(order.updateInfoParty);

// router.route("/cancelOrder/:orderId").get(order.cancelOrderUser);

// router.route("/getOrder").get(order.getOrderUnconfirm);

// .delete(order.deleteAll)

// router.route("/allOrder").get(order.findAllOrders);

// router.route("/cancel/:userId/:orderId").get(order.cancelOrder);

//
// router
// .route("findOne/:id")
// .get(service.findOneService)
// .get(order.findOneOrder);

module.exports = router;
