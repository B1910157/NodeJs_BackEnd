const express = require("express");

const service = require("../controllers/serviceProvider.controller");
const menu = require("../controllers/menu_of_service.controller");
const cart = require("../controllers/cart.controller");
const food = require("../controllers/food.controller");
const drink = require("../controllers/drink.controller");
const other = require("../controllers/other.controller");
const employ = require("../controllers/job.controller");

const router = express.Router();

router.route("/").get(service.findAllServiceShow);

router.route("/employments").get(employ.findAllJobPublish);

router
  .route("/findOneFood/:service_id/:foodId")
  .get(service.findOneFoodWithUser);

router.route("/registerService").post(service.create);

//CHOOSE SERVICE
router.route("/chooseService/:service_id").get(cart.chooseService);
router.route("/unChoose").put(cart.removeService);

router.route("/:service_id").get(service.findOneService);

router.route("/:service_id/getMenu").get(menu.getMenuOfServiceForUser);

//Get food of service
router.route("/:service_id/getFood").get(food.findAllFoodOfService);

//Get Drink of service
router.route("/:service_id/getDrink").get(drink.findAllDrinkOfService);

//Get other of service

router.route("/:service_id/getOther").get(other.findAllOtherOfService);

module.exports = router;
