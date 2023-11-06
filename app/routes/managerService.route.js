const express = require("express");

const service = require("../controllers/serviceProvider.controller");
const order = require("../controllers/order.controller");
const user = require("../controllers/user.controller");
const router = express.Router();

router.route("/").get(service.findAllService);
router.route("/updateStatus").put(service.updateStatus);

//ORDER
router
  .route("/findOrderByMonth/:service_id")
  .get(order.findAllOrderOfServiceByMonth);
router
  .route("/findOrdersSuccess/:service_id")
  .get(order.findAllOrderOfServiceSuccess);

router.route("/findOrdersByMonthOfAllService").get(order.findAllOrderByMonth);

router.route("/findOrdersSuccessOfAllService").get(order.findAllOrderSuccess);

//count user
router.route("/countUser").get(user.countUser);
//count service
router.route("/countService").get(service.findAllService);
//total deposit
router.route("/totalDeposit").get(order.findAllOrderToGetDeposit);
module.exports = router;
