const express = require("express");

const order = require("../controllers/order.controller");
// const service = require("../controllers/serviceProvider.controller")

const router = express.Router();

router.route("/").get(order.findAllOrderOfService);
router.route("/:orderId").get(order.findOneOrderOfService);
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
  .route("/:orderId/addOrUpdateDrink")
  .put(order.addOrUpdateDrinkInCartOfOrder);

router
  .route("/removeDrinkInOrder/:orderId/:drinkId")
  .delete(order.removeDrinkInOrder);

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
