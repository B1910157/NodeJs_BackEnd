const express = require("express");
const service = require("../controllers/serviceProvider.controller");
const menu = require("../controllers/menu_of_service.controller");
const cart = require("../controllers/cart.controller");
const info = require("../controllers/user.controller");
const { route } = require("./user.route");


const router = express.Router();


//CHOOSE SERVICE
router.route("/chooseService/:service_id").get(cart.chooseService);
router.route("/unChoose").put(cart.removeService)

//FOOD
router.route("/addFoodFromMenu/:service_id/:menuId").get(cart.addFoodFromMenu);
router.route("/addFoodToCart/:service_id/:foodId").get(cart.addFoodToCart);
router.route("/:service_id/removeFoodInCart/:foodId").delete(cart.removeFoodInCart);


//OTHER
router.route("/addOtherToCart/:service_id/:otherId").get(cart.addOtherToCart);
router.route("/:service_id/removeOtherInCart/:otherId").delete(cart.removeOtherInCart);


//Drink
router.route("/:service_id/addDrink")
        .put(cart.addDrinkToCart);
router.route("/:service_id/removeDrink/:drinkId")
        .get(cart.removeDrinkInCart);


//Update chưa dùng?        
router.route("/:service_id/updateDrink")
        .put(cart.updateDrinkInCart);


//Cart
// router.route("/cart").get(info.findFoodInCartOfUser)


module.exports = router;
