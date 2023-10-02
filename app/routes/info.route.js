const express = require("express");

const info = require("../controllers/user.controller");
// const service = require("../controllers/serviceProvider.controller")
// const user = require("../controllers/user.controller")

const router = express.Router();

router.route("/").get(info.findAllOfUser).post(info.updateInfo);
router.route("/:userId").get(info.findOneUser);

module.exports = router;
