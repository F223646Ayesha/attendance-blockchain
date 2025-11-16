const express = require("express");
const router = express.Router();
const controller = require("../controllers/attendanceController");

router.post("/mark", controller.markAttendance);

module.exports = router;
