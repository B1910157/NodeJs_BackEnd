const express = require("express");
const service = require("../controllers/serviceProvider.controller");

const router = express.Router();

router.route("/register").post(service.create);
router.route("/login" ).post(service.login);
router.route("/logout").post(service.logout);

// //Foods
// router.route("/foods").get(service.findAllFood).post(service.addFood);
// router
//   .route("/foods/:id")
//   .get(service.findOneFood)
//   .put(service.updateOneFood)
//   .delete(service.deleteOneFood);

// //Others
// router.route("/others").get(service.findAllOther).post(service.addOther);
// router
//   .route("/others/:id")
//   .get(service.findOneOther)
//   .put(service.updateOneOther)
//   .delete(service.deleteOneOther);

// router.route("/update_support_area").post(service.updateSupportArea)

// router.route("/:service_id")
//     .get(service.findOneService);

module.exports = router;
