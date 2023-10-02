const express = require("express");

const order = require("../controllers/user.controller");
// const service = require("../controllers/serviceProvider.controller")

const router = express.Router();


router.route("/:userId/:orderId")
    // .get(service.findOneService)
    // .get(order.findOneOrderAdmin)
    .get(order.cancelOrder)
  
    

module.exports = router;