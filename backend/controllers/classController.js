const fs = require("fs");
const path = require("path");
const ClassChain = require("../models/ClassChain");

const dbPath = path.join(__dirname, "../db/saved.json");
let DB = JSON.parse(fs.readFileSync(dbPath, "utf8"));

function saveDB() {
    fs.writeFileSync(dbPath, JSON.stringify(DB, null, 2));
}

module.exports = {
    addClass(req, res) {
        const { deptName, className } = req.body;

        if (!DB.departments[deptName]) {
            return res.status(404).json({ error: "Department not found" });
        }

        if (!DB.departments[deptName].classes) {
            DB.departments[deptName].classes = {};
        }

        if (DB.departments[deptName].classes[className]) {
            return res.status(400).json({ error: "Class already exists" });
        }

        const classChain = new ClassChain(
            className,
            DB.departments[deptName]
        );

        DB.departments[deptName].classes[className] = classChain;

        saveDB();
        res.json({ success: true });
    },

    getClasses(req, res) {
        const { deptName } = req.params;

        if (!DB.departments[deptName]) {
            return res.status(404).json({ error: "Department not found" });
        }

        res.json(DB.departments[deptName].classes || {});
    },

    updateClass(req, res) {
    const { deptName, className } = req.params;
    const { newName } = req.body;

    const dept = DB.departments[deptName];
    if (!dept) return res.status(404).json({ error: "Department not found" });

    const oldClassJson = dept.classes[className];
    if (!oldClassJson) return res.status(404).json({ error: "Class not found" });

    // Rebuild chain instance
    const ClassChain = require("../models/ClassChain");
    const classObj = new ClassChain(className, dept);
    classObj.chain = oldClassJson.chain;

    // Add update block
    classObj.addBlock({
        type: "CLASS_UPDATE",
        oldName: className,
        newName
    });

    // ❗ Remove OLD key
    delete dept.classes[className];

    // ❗ Save NEW key
    dept.classes[newName] = classObj;

    saveDB();

    // ❗ Return updated list (so frontend renders new names)
    return res.json({ success: true, updatedClasses: dept.classes });
}
,
getChain(req, res) {
    const { deptName, className } = req.params;

    const dept = DB.departments[deptName];
    if (!dept) {
        return res.status(404).json({ error: "Department not found" });
    }

    const cls = dept.classes?.[className];
    if (!cls) {
        return res.status(404).json({ error: "Class not found" });
    }

    return res.json(cls.chain || []);
},

deleteClass(req, res) {
    const { deptName, className } = req.params;

    const dept = DB.departments[deptName];
    if (!dept) return res.status(404).json({ error: "Department not found" });

    const classJson = dept.classes[className];
    if (!classJson) return res.status(404).json({ error: "Class not found" });

    const ClassChain = require("../models/ClassChain");
    const classObj = new ClassChain(className, dept);
    classObj.chain = classJson.chain;

    classObj.addBlock({
        type: "CLASS_DELETE",
        status: "deleted"
    });

    // ❗ Remove class completely
    delete dept.classes[className];

    saveDB();

    // ❗ Return updated list
    return res.json({ success: true, updatedClasses: dept.classes });
}
};
