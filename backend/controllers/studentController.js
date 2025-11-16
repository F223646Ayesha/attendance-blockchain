// controllers/studentController.js

const fs = require("fs");
const path = require("path");

const StudentChain = require("../models/StudentChain");
const ClassChain = require("../models/ClassChain");

const dbPath = path.join(__dirname, "../db/saved.json");
let DB = JSON.parse(fs.readFileSync(dbPath, "utf8"));

function saveDB() {
    fs.writeFileSync(dbPath, JSON.stringify(DB, null, 2));
}

module.exports = {

    // ==========================================================
    // ADD STUDENT
    // ==========================================================
    addStudent(req, res) {
        const { deptName, className, roll, name } = req.body;

        const deptJson = DB.departments[deptName];
        if (!deptJson) return res.status(404).json({ error: "Department not found" });

        const classJson = deptJson.classes[className];
        if (!classJson) return res.status(404).json({ error: "Class not found" });

        if (!classJson.students) classJson.students = {};

        if (classJson.students[roll]) {
            return res.status(400).json({ error: "Student already exists" });
        }

        const studentObj = new StudentChain(
            { name, roll },
            classJson,
            deptJson
        );

        studentObj.addBlock({
            type: "STUDENT_ADD",
            roll,
            name
        });

        classJson.students[roll] = studentObj;

        saveDB();
        res.json({ success: true, student: studentObj });
    },


    // ==========================================================
    // LIST STUDENTS
    // ==========================================================
    listStudents(req, res) {
        const { deptName, className } = req.params;

        const deptJson = DB.departments[deptName];
        if (!deptJson) return res.status(404).json({ error: "Department not found" });

        const classJson = deptJson.classes[className];
        if (!classJson) return res.status(404).json({ error: "Class not found" });

        res.json(classJson.students || {});
    },


    // ==========================================================
    // UPDATE STUDENT
    // ==========================================================
    updateStudent(req, res) {
        const { deptName, className, roll } = req.params;

        // Accept BOTH name/newName
        const newName = req.body.newName || req.body.name;

        if (!newName) {
            return res.status(400).json({ error: "New name is required" });
        }

        const deptJson = DB.departments[deptName];
        if (!deptJson) return res.status(404).json({ error: "Department not found" });

        const classJson = deptJson.classes[className];
        if (!classJson) return res.status(404).json({ error: "Class not found" });

        const studentJson = classJson.students?.[roll];
        if (!studentJson) return res.status(404).json({ error: "Student not found" });

        const studentObj = new StudentChain(
            { name: newName, roll },
            classJson,
            deptJson
        );

        studentObj.chain = studentJson.chain;

        studentObj.addBlock({
            type: "STUDENT_UPDATE",
            roll,
            newName
        });

        // update stored metadata
        studentObj.student.name = newName;

        classJson.students[roll] = studentObj;

        saveDB();

        res.json({ success: true });
    },


    // ==========================================================
    // DELETE STUDENT
    // ==========================================================
    deleteStudent(req, res) {
        const { deptName, className, roll } = req.params;

        const deptJson = DB.departments[deptName];
        if (!deptJson) return res.status(404).json({ error: "Department not found" });

        const classJson = deptJson.classes[className];
        if (!classJson) return res.status(404).json({ error: "Class not found" });

        const studentJson = classJson.students?.[roll];
        if (!studentJson) return res.status(404).json({ error: "Student not found" });

        const studentObj = new StudentChain(
            studentJson.student,
            classJson,
            deptJson
        );

        studentObj.chain = studentJson.chain;

        studentObj.addBlock({
            type: "STUDENT_DELETE",
            roll,
            status: "deleted"
        });

        // Actually delete
        delete classJson.students[roll];

        saveDB();

        res.json({ success: true });
    },


    // ==========================================================
    // GET STUDENT LEDGER / CHAIN
    // ==========================================================
    getChain(req, res) {
        const { deptName, className, roll } = req.params;

        const deptJson = DB.departments[deptName];
        if (!deptJson) return res.status(404).json({ error: "Department not found" });

        const classJson = deptJson.classes[className];
        if (!classJson) return res.status(404).json({ error: "Class not found" });

        const studentJson = classJson.students?.[roll];
        if (!studentJson) return res.status(404).json({ error: "Student not found" });

        res.json(studentJson.chain);
    }
};
