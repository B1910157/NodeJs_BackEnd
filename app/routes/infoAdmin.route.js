const express = require("express");

const admin = require("../controllers/admin.controller");

const router = express.Router();
router.route("/").get(admin.findOneAdmin).post(admin.updateInfo);
module.exports = router;
