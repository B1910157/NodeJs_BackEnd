const express = require("express");
const admin = require("../controllers/admin.controller");
// const menu =  require("../controllers/menu.controller");

const router = express.Router();

router.route("/register").post(admin.create);
router.route("/login").post(admin.loginAdmin);
// router.route("/").get(user.findAllOfUser).post(user.updateInfo);

// router.route("/:userId").get(user.findOneUser);

// router.route("/loginadmin").post(user.loginadmin);
// router.route("/logout").post(user.logout);

module.exports = router;
