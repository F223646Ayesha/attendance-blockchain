// controllers/validationController.js
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const dbPath = path.join(__dirname, "../db/saved.json");

// --- helper to load & save DB ---
function loadDB() {
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

function saveDB(DB) {
  fs.writeFileSync(dbPath, JSON.stringify(DB, null, 2));
}

// --- core: recompute hash exactly like Block did when mining ---
function hashBlock(b) {
  return crypto
    .createHash("sha256")
    .update(
      String(b.index) +
        String(b.timestamp) +
        JSON.stringify(b.transactions) +
        String(b.prev_hash ?? "") +
        String(b.nonce ?? 0)
    )
    .digest("hex");
}

// --- validate a single chain (department / class / student) ---
function validateChain(chain) {
  if (!Array.isArray(chain) || chain.length === 0) return true;

  for (let i = 1; i < chain.length; i++) {
    const current = chain[i];
    const prev = chain[i - 1];

    const recalculated = hashBlock(current);

    if (current.hash !== recalculated) return false;
    if (current.prev_hash !== prev.hash) return false;
    if (!String(current.hash).startsWith("0000")) return false;
  }
  return true;
}

// ======================================================
// GET /validate/all  →  full report for Dept → Class → Student
// ======================================================
module.exports.validateAll = (req, res) => {
  const DB = loadDB();

  const report = {
    valid: true,
    issues: [],
    details: {}
  };

  for (const deptName in DB.departments) {
    const dept = DB.departments[deptName];

    const deptValid = validateChain(dept.chain);

    const deptDetails = {
      departmentValid: deptValid,
      classes: {}
    };

    report.details[deptName] = deptDetails;

    if (!deptValid) {
      report.valid = false;
      report.issues.push(`Department chain broken: ${deptName}`);
    }

    if (!dept.classes) continue;

    // ---- classes ----
    for (const className in dept.classes) {
      const cls = dept.classes[className];

      const classValid = validateChain(cls.chain);

      const classGenesisParent = cls.chain[0]?.prev_hash;
      const deptLatestHash = dept.chain[dept.chain.length - 1]?.hash;
      const genesisLinkOK = classGenesisParent === deptLatestHash;

      const classDetails = {
        classValid,
        genesisLinkOK,
        students: {}
      };

      deptDetails.classes[className] = classDetails;

      if (!classValid) {
        report.valid = false;
        report.issues.push(`Class chain broken: ${deptName} → ${className}`);
      }
      if (!genesisLinkOK) {
        report.valid = false;
        report.issues.push(
          `Class genesis parent hash mismatch: ${deptName} → ${className}`
        );
      }

      if (!cls.students) continue;

      // ---- students ----
      for (const roll in cls.students) {
        const student = cls.students[roll];

        const studentValid = validateChain(student.chain);

        const studentGenesisParent = student.chain[0]?.prev_hash;
        const classLatestHash = cls.chain[cls.chain.length - 1]?.hash;
        const studentLinkOK = studentGenesisParent === classLatestHash;

        classDetails.students[roll] = {
          studentValid,
          studentLinkOK
        };

        if (!studentValid) {
          report.valid = false;
          report.issues.push(
            `Student chain broken: ${deptName} → ${className} → ${roll}`
          );
        }

        if (!studentLinkOK) {
          report.valid = false;
          report.issues.push(
            `Student genesis parent hash mismatch: ${deptName} → ${className} → ${roll}`
          );
        }
      }
    }
  }

  res.json(report);
};

// ======================================================
// POST /validate/rebuild  →  optional helper to “heal” hashes
// ======================================================
module.exports.rebuildBlockchain = (req, res) => {
  const DB = loadDB();

  function fixChain(chain) {
    if (!Array.isArray(chain) || chain.length === 0) return;

    for (let i = 0; i < chain.length; i++) {
      const block = chain[i];

      if (i > 0) {
        // ensure prev_hash always points to previous block
        block.prev_hash = chain[i - 1].hash;
      }
      // recompute hash based on current fields
      block.hash = hashBlock(block);
    }
  }

  for (const deptName in DB.departments) {
    const dept = DB.departments[deptName];

    fixChain(dept.chain);

    if (!dept.classes) continue;

    for (const className in dept.classes) {
      const cls = dept.classes[className];

      fixChain(cls.chain);

      if (!cls.students) continue;

      for (const roll in cls.students) {
        const student = cls.students[roll];
        fixChain(student.chain);
      }
    }
  }

  saveDB(DB);
  res.json({ message: "Blockchain rebuilt & hashes refreshed successfully." });
};
