const fs = require("fs");
const path = require("path");
const StudentChain = require("../models/StudentChain");

const dbPath = path.join(__dirname, "../db/saved.json");
let DB = JSON.parse(fs.readFileSync(dbPath, "utf8"));

function saveDB() {
    fs.writeFileSync(dbPath, JSON.stringify(DB, null, 2));
}

function getDateOnly(ts) {
    const d = new Date(ts);
    return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

module.exports = {
    markAttendance(req, res) {
        const { deptName, className, roll, status } = req.body;

        // ---------------------------
        // Validate Department & Class
        // ---------------------------
        const dept = DB.departments?.[deptName];
        if (!dept) return res.status(404).json({ error: "Department not found" });

        const classJson = dept.classes?.[className];
        if (!classJson) return res.status(404).json({ error: "Class not found" });

        const studentJson = classJson.students?.[roll];
        if (!studentJson)
            return res.status(404).json({ error: "Student not found" });

        // ---------------------------
        // Prevent attendance duplicate for same day
        // ---------------------------
        const today = getDateOnly(Date.now());

        const alreadyMarked = studentJson.chain.some(b => {
            if (b.transactions?.type === "ATTENDANCE_MARK") {
                const blockDate = getDateOnly(b.transactions.timestamp);
                return blockDate === today;
            }
            return false;
        });

        if (alreadyMarked) {
            return res.status(400).json({
                error: "Attendance already marked for today"
            });
        }

        // ---------------------------
        // Rebuild StudentChain safely
        // ---------------------------
        const studentObj = new StudentChain(
            { name: studentJson.student.name, roll },
            classJson,
            dept
        );

        studentObj.chain = [...studentJson.chain];

        // ---------------------------
        // Add new attendance block
        // ---------------------------
        const ts = Date.now();

        studentObj.addBlock({
            type: "ATTENDANCE_MARK",
            roll,
            deptName,
            className,
            status,
            timestamp: ts
        });

        classJson.students[roll] = studentObj;
        saveDB();

        res.json({
            success: true,
            message: "Attendance marked",
            timestamp: ts
        });
    }
};
