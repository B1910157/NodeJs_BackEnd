const express = require("express");
const admin = require("../controllers/admin.controller");
// const menu =  require("../controllers/menu.controller");
const service = require("../controllers/serviceProvider.controller");

const router = express.Router();
// router.route("/").get(admin.findOneAdmin).post(admin.updateInfo);
router.route("/adminCreateService").post(service.adminCreate);
router.route("/register").post(admin.create);
router.route("/login").post(admin.loginAdmin);
router.route("/logout").post(admin.logout);
// router.route("/").get(user.findAllOfUser).post(user.updateInfo);

// router.route("/:userId").get(user.findOneUser);

// router.route("/loginadmin").post(user.loginadmin);
// router.route("/logout").post(user.logout);

module.exports = router;
