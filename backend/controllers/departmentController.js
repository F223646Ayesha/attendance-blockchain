const fs = require("fs");
const path = require("path");

const DepartmentChain = require("../models/DepartmentChain");
const ClassChain = require("../models/ClassChain");

const dbPath = path.join(__dirname, "../db/saved.json");

// Load DB once into memory
let DB = JSON.parse(fs.readFileSync(dbPath, "utf8"));

function saveDB() {
  fs.writeFileSync(dbPath, JSON.stringify(DB, null, 2));
}

module.exports = {
  addDepartment(req, res) {
    const { name } = req.body;

    if (DB.departments[name]) {
      return res.status(400).json({ error: "Department already exists" });
    }

    // New department gets its own DepartmentChain instance
    DB.departments[name] = new DepartmentChain(name);
    saveDB();

    res.json({ success: true, chain: DB.departments[name] });
  },

  listAllDepartments(req, res) {
    res.json(Object.keys(DB.departments || {}));
  },

  getAll(req, res) {
    res.json(DB.departments || {});
  },

  getChain(req, res) {
    const { deptName } = req.params;

    const dept = DB.departments[deptName];
    if (!dept) {
      return res.status(404).json({ error: "Department not found" });
    }

    return res.json(dept.chain || []);
  },

  // ------------- FIXED UPDATE -------------
  updateDepartment(req, res) {
    const { name } = req.params;
    const { newName } = req.body;

    if (!DB.departments[name]) {
      return res.status(404).json({ error: "Not found" });
    }

    if (!newName || !newName.trim()) {
      return res
        .status(400)
        .json({ error: "New department name is required" });
    }

    const dept = DB.departments[name];

    // ✅ Rehydrate: create a DepartmentChain instance and load existing blocks
    const chainInstance = new DepartmentChain(name);
    chainInstance.chain = dept.chain || chainInstance.chain;

    // ✅ Add an update block (addBlock itself pushes into chain)
    chainInstance.addBlock({
      type: "DEPARTMENT_UPDATE",
      oldName: name,
      newName: newName.trim(),
      status: "active",
      timestamp: Date.now(),
    });

    // ✅ Copy updated chain back into the stored dept object
    dept.chain = chainInstance.chain;

    // If the name actually changed, move the object under the new key
    if (newName !== name) {
      DB.departments[newName] = dept;
      delete DB.departments[name];
    }

    saveDB();

    res.json({ success: true, chain: dept });
  },

  // ------------- FIXED DELETE -------------
  deleteDepartment(req, res) {
    const { name } = req.params;

    if (!DB.departments[name]) {
      return res.status(404).json({ error: "Not found" });
    }

    const dept = DB.departments[name];

    // ✅ Rehydrate: create instance and load existing chain
    const chainInstance = new DepartmentChain(name);
    chainInstance.chain = dept.chain || chainInstance.chain;

    // ✅ Add a delete block (soft delete)
    chainInstance.addBlock({
      type: "DEPARTMENT_DELETE",
      status: "deleted",
      name,
      timestamp: Date.now(),
    });

    // ✅ Copy updated chain back
    dept.chain = chainInstance.chain;

    // IMPORTANT: we keep the department in DB to preserve history.
    // Frontend already hides deleted ones by checking status === "deleted".

    saveDB();

    res.json({ success: true, chain: dept });
  },
};
