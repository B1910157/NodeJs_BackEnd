const express = require("express");
const comment = require("../controllers/comment.controller");
const evaluate = require("../controllers/evaluate.controller");

const router = express.Router();
//COMMENT
router.route("/comment/:service_id").get(comment.findAllCommentOfServiceReal);
router.route("/comment").post(comment.create);
router.route("/comment").get(comment.findAllComment);

//EVALUATE
router
  .route("/evaluate/:service_id")
  .get(evaluate.findAllEvaluateOfServiceReal);
router.route("/evaluate").post(evaluate.create);
router.route("/evaluate").get(evaluate.findAllEvaluate);

module.exports = router;
