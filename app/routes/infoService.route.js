const express = require("express");

const info = require("../controllers/serviceProvider.controller");
// const service = require("../controllers/serviceProvider.controller")
// const user = require("../controllers/user.controller")

const router = express.Router();

router.route("/").get(info.findOneService).post(info.updateInfo);
router.route("/:service_id").get(info.findOneService);

module.exports = router;
