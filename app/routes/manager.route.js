const express = require("express");

const service = require("../controllers/serviceProvider.controller");
const menu = require("../controllers/menu_of_service.controller");
const food = require("../controllers/food.controller");
const drink = require("../controllers/drink.controller");
const other = require("../controllers/other.controller");
const { route } = require("./service.route");
const router = express.Router();

//Food
router.route("/food").get(food.findAllFoodOfService).post(food.create);

router
  .route("/food/:foodId")
  .get(food.findOne)
  .put(food.update)
  .delete(food.delete);

//Drink
router.route("/drink").get(drink.findAllDrinkOfService).post(drink.create);

router
  .route("/drink/:drinkId")
  .get(drink.findOne)
  .put(drink.update)
  .delete(drink.delete);

//Other
router.route("/other").get(other.findAllOtherOfService).post(other.create);

router
  .route("/other/:otherId")
  .get(other.findOne)
  .put(other.update)
  .delete(other.delete);

// //Others
// router.route("/others").get(service.findAllOther).post(service.addOther);

// router
//   .route("/others/:id")
//   .get(service.findOneOther)
//   .put(service.updateOneOther)
//   .delete(service.deleteOneOther);

//Menu Food
router.route("/menu").post(menu.createMenu);
router.route("/menu/:id").get(menu.getOneMenu);
router.route("/menu/:menu_id").post(menu.updateNameMenu);
router
  .route("/menu/findFoodNotInMenu/:menu_id")
  .get(menu.getAllFoodNotInOneMenu);
router.route("/getMenu").get(menu.getMenuOfService);
router.route("/addFood/:id/:foodId").post(menu.addToMenuFood);
router.route("/menu/:id/food/:foodId").delete(menu.deleteFoodInMenu);
router.route("/menu/:id").delete(menu.deleteMenu);

module.exports = router;
