const express = require("express");

const type_party = require("../controllers/type_party.controller");


const router = express.Router();

router.route("/")
    .get(type_party.findAll)
    .post(type_party.create)
  

router.route("/:id")
    .get(type_party.findOne)
    .put(type_party.update)
    .delete(type_party.delete);



module.exports = router;