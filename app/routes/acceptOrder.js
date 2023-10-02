const express = require("express");

const order = require("../controllers/user.controller");
// const service = require("../controllers/serviceProvider.controller")

const router = express.Router();


router.route("/")
    .get(order.findAllOrders)
    
    
router.route("/:userId/:orderId")
    // .get(service.findOneService)
    // .get(order.findOneOrderAdmin)
    .get(order.acceptOrder)
  

    

module.exports = router;