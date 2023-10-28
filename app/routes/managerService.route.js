const express = require("express");

const service = require("../controllers/serviceProvider.controller");
const menu = require("../controllers/menu_of_service.controller");
const cart = require("../controllers/cart.controller");
const food = require("../controllers/food.controller");
const drink = require("../controllers/drink.controller");
const other = require("../controllers/other.controller");

const router = express.Router();

router.route("/").get(service.findAllService);
router.route("/updateStatus").put(service.updateStatus);

module.exports = router;
