const express = require("express");
const router = express.Router();
const controller = require("../controllers/departmentController");

router.post("/add", controller.addDepartment);
router.get("/all", controller.getAll);
router.put("/update/:name", controller.updateDepartment);
router.put("/delete/:name", controller.deleteDepartment);
router.get("/chain/:deptName", controller.getChain);
router.get("/all", controller.listAllDepartments);

module.exports = router;
