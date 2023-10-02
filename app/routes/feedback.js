const express = require("express");

const feedback = require("../controllers/feedback.controller");
// const service = require("../controllers/serviceProvider.controller")
// const user = require("../controllers/user.controller")

const router = express.Router();

router.route("/")
    .post(feedback.createFeedBack)
    .get(feedback.findAllFeedBack)
    
// router.route("/")
//     .post(feedback.createFeedBack)
//     .get(feedback.findAllFeedBack)  

    

module.exports = router;