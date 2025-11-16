const express = require("express");
const router = express.Router();
const controller = require("../controllers/classController");

router.post("/add", controller.addClass);
router.get("/:deptName", controller.getClasses);
router.put("/update/:deptName/:className", controller.updateClass);
router.put("/delete/:deptName/:className", controller.deleteClass);
router.get("/chain/:deptName/:className", controller.getChain);
module.exports = router;
