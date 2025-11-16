const express = require("express");
const router = express.Router();
const controller = require("../controllers/studentController");

router.post("/add", controller.addStudent);
router.put("/update/:deptName/:className/:roll", controller.updateStudent);
router.put("/delete/:deptName/:className/:roll", controller.deleteStudent);
router.get("/chain/:deptName/:className/:roll", controller.getChain);
router.get("/:deptName/:className", controller.listStudents);

module.exports = router;
