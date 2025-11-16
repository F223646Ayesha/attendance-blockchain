// routes/validation.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/validationController");

router.get("/all", controller.validateAll);
router.post("/rebuild", controller.rebuildBlockchain);

module.exports = router;
