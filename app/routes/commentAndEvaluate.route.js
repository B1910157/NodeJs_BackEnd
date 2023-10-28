const express = require("express");
const comment = require("../controllers/comment.controller");

const router = express.Router();
//COMMENT
router.route("/comment/:service_id").get(comment.findAllCommentOfServiceReal);
router.route("/comment").post(comment.create);

module.exports = router;
