const express = require("express");

const food_category = require("../controllers/food_category.controller");


const router = express.Router();

router.route("/")
    .get(food_category.findAll)
    .post(food_category.create)
  

router.route("/:id")
    .get(food_category.findOne)
    .put(food_category.update)
    .delete(food_category.delete);



module.exports = router;