const express = require("express");


const food = require("../controllers/food.controller");
const drink = require("../controllers/drink.controller");
const other = require("../controllers/other.controller");
const { route } = require("./service.route");
const router = express.Router();

//Drink
router.route("/drink")
    .get(drink.findAllDrinkOfService)


router.route("/drink/:drinkId")
    .get(drink.findOneDrink)



module.exports = router;
