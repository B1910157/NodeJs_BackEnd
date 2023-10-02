const express = require("express");

const cart = require("../controllers/cart.controller");
const { route } = require("./user.route");


const router = express.Router();

//FOOD
// router.route("/:service_id/addFoodFromMenu").post(cart.addFoodFromMenu);
// router.route("/:service_id/addFoodToCart").post(cart.addFoodToCart);
// router.route("/:service_id/removeFoodInCart").delete(cart.removeFoodInCart);


//OTHER
// router.route("/:service_id/addOtherToCart").post(cart.addOtherToCart);
// router.route("/:service_id")

//Cart
// router.route("/").get(cart.findFoodInCartOfUser)
router.route("/findFood").get(cart.findFoodInCartOfUser)
router.route("/findDrink").get(cart.findDrinkInCart)
router.route("/findOther").get(cart.findOtherInCart)


module.exports = router;
