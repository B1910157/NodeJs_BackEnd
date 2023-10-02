const express = require("express");
const user = require("../controllers/user.controller");
// const menu =  require("../controllers/menu.controller");

const router = express.Router();

router.route("/register").post(user.create);
router.route("/login").post(user.login);
router.route("/").get(user.findAllOfUser).post(user.updateInfo);


router.route("/:userId").get(user.findOneUser);

// router.route("/loginadmin").post(user.loginadmin);
router.route("/logout").post(user.logout);

module.exports = router;
