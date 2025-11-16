const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const StudentChain = require("../models/StudentChain");

const dbPath = path.join(__dirname, "../db/saved.json");
let DB = JSON.parse(fs.readFileSync(dbPath, "utf8"));

function saveDB() {
    fs.writeFileSync(dbPath, JSON.stringify(DB, null, 2));
}

// ➤ Mark attendance
router.post("/mark", (req, res) => {
    const { deptName, className, roll, status } = req.body;

    const studentJson = DB.departments[deptName]
        .classes[className]
        .students[roll];

    if (!studentJson)
        return res.status(404).json({ message: "Student not found" });

    // Restore class + dept to rebuild student chain
    const classJson = DB.departments[deptName].classes[className];
    const deptJson = DB.departments[deptName];

    const restored = new StudentChain(roll, classJson, deptJson);
    restored.chain = studentJson.chain;

    restored.addAttendance(status);

    // Save back
    studentJson.chain = restored.chain;
    saveDB();

    res.json({ message: "Attendance recorded", block: restored.getLatestBlock() });
});

// ➤ Get attendance ledger
router.get("/ledger/:dept/:class/:roll", (req, res) => {
    const { dept, class: cls, roll } = req.params;

    const data = DB.departments[dept]
        .classes[cls]
        .students[roll];

    res.json(data.chain);
});

module.exports = router;
