// ===============================
// LOAD STUDENTS PAGE (Beautified)
// ===============================
async function loadStudentsPage() {
  let html = `
    <section class="mb-8">
      <h1 class="text-3xl md:text-4xl font-bold text-slate-50 mb-2 flex items-center gap-2">
        <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 text-slate-950 text-xl font-bold shadow-lg shadow-sky-400/40">
          S
        </span>
        Students
      </h1>
      <p class="text-slate-300 max-w-2xl text-sm md:text-base">
        Manage students for each class. Every student owns a dedicated blockchain where individual
        attendance blocks are mined and linked to their academic history.
      </p>
    </section>

    <section class="grid gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.7fr)] items-start">
      <!-- LEFT: Add Student -->
      <div class="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-xl shadow-black/40">
        <h2 class="text-xl font-semibold text-slate-100 mb-3 flex items-center gap-2">
          <span class="h-7 w-1 rounded-full bg-gradient-to-b from-sky-400 to-indigo-400"></span>
          Add Student
        </h2>
        <p class="text-xs text-slate-400 mb-4">
          Use consistent department, class, and roll formats (e.g.,
          <span class="font-mono text-slate-300">SE</span>,
          <span class="font-mono text-slate-300">SE-3A</span>,
          <span class="font-mono text-slate-300">22F-3646</span>).
          A new student chain will be initialized and linked to the class chain.
        </p>

        <div class="space-y-3">
          ${inputField("dept", "Department (e.g., SE, CS)")}
          ${inputField("cls", "Class (e.g., SE-3A, CS-5B)")}
          ${inputField("roll", "Roll Number (e.g., 22F-3646)")}
          ${inputField("name", "Student Name")}

          <button
            onclick="addStudent()"
            class="w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r
                   from-sky-500 via-indigo-500 to-violet-500 px-4 py-2.5 text-sm font-semibold
                   text-white shadow-md shadow-sky-500/40 hover:shadow-lg hover:from-sky-400 hover:to-violet-400 transition"
          >
            + Add Student
          </button>
        </div>

        <div class="mt-6 rounded-xl bg-slate-900/80 border border-slate-800/80 px-4 py-3 text-xs text-slate-400 flex items-start gap-2">
          <span class="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-sky-500/15 text-sky-300 text-[10px] border border-sky-500/40">
            ℹ
          </span>
          <p>
            Each student gets a <span class="text-sky-300 font-medium">StudentChain</span>.
            Attendance blocks are appended to this chain and can be explored later via the Explorer page.
          </p>
        </div>
      </div>

      <!-- RIGHT: View Students -->
      <div>
        <div class="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 md:p-6 mb-4">
          <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <h2 class="text-xl font-semibold text-slate-100 flex items-center gap-2">
                <span class="h-7 w-1 rounded-full bg-gradient-to-b from-emerald-400 to-cyan-400"></span>
                View Students by Class
              </h2>
              <p class="text-xs text-slate-400 mt-1">
                Enter department and class to view all active students in that section.
              </p>
            </div>
            <div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div class="flex-1">
                ${inputField("vDept", "Dept")}
              </div>
              <div class="flex-1">
                ${inputField("vClass", "Class")}
              </div>
              <button
                onclick="viewStudents()"
                class="inline-flex items-center justify-center rounded-xl bg-slate-800/90 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-emerald-500/90 hover:text-slate-950 border border-slate-700/80 hover:border-emerald-400/80 transition"
              >
                Load Students
              </button>
            </div>
          </div>
        </div>

        <div id="studentList" class="grid gap-4 md:grid-cols-2"></div>
      </div>
    </section>
  `;

  app.innerHTML = html;
}

// ===============================
// ADD STUDENT
// ===============================
async function addStudent() {
  const deptInput = document.getElementById("dept");
  const classInput = document.getElementById("cls");
  const rollInput = document.getElementById("roll");
  const nameInput = document.getElementById("name");

  const dept = deptInput.value.trim().toUpperCase();
  const cls = classInput.value.trim().toUpperCase();
  const roll = rollInput.value.trim();
  const name = nameInput.value.trim();

  if (!dept || !cls || !roll || !name) {
    alert("All fields are required!");
    if (!dept) deptInput.focus();
    else if (!cls) classInput.focus();
    else if (!roll) rollInput.focus();
    else nameInput.focus();
    return;
  }

  const res = await apiPost("/students/add", {
    deptName: dept,
    className: cls,
    roll,
    name,
  });

  if (res.error) {
    alert(res.error);
    return;
  }

  alert("Student added successfully!");

  // Keep dept/class for quick multiple inserts, just clear roll + name
  rollInput.value = "";
  nameInput.value = "";
  rollInput.focus();

  // Also pre-fill view section, so user can quickly load roster
  document.getElementById("vDept").value = dept;
  document.getElementById("vClass").value = cls;
}

// ===============================
// VIEW STUDENTS
// ===============================
async function viewStudents() {
  const vDeptInput = document.getElementById("vDept");
  const vClassInput = document.getElementById("vClass");

  const dept = vDeptInput.value.trim().toUpperCase();
  const cls = vClassInput.value.trim().toUpperCase();

  if (!dept || !cls) {
    alert("Enter department and class!");
    if (!dept) vDeptInput.focus();
    else vClassInput.focus();
    return;
  }

  const res = await apiGet(`/students/${dept}/${cls}`);

  if (res.error) {
    alert(res.error);
    return;
  }

  let html = "";

  for (const roll in res) {
    if (!Object.prototype.hasOwnProperty.call(res, roll)) continue;

    const student = res[roll].student;

    html += `
      <article class="group bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 md:p-5 hover:border-sky-400/80 hover:shadow-lg hover:shadow-sky-500/30 transition-all">
        <div class="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 class="text-lg font-semibold text-slate-50 group-hover:text-white">
              ${student.name}
            </h3>
            <p class="text-xs text-slate-400 mt-1">
              Roll: <span class="font-mono text-sky-300">${roll}</span>
            </p>
            <p class="text-xs text-slate-400 mt-0.5">
              Class: <span class="text-emerald-300 font-medium">${cls}</span>
              <span class="text-slate-500 mx-1">•</span>
              Dept: <span class="text-indigo-300 font-medium">${dept}</span>
            </p>
          </div>
          <span class="inline-flex items-center rounded-full bg-indigo-500/10 text-indigo-300 px-3 py-1 text-[11px] font-medium border border-indigo-500/40">
            Student Chain
          </span>
        </div>

        <div class="flex gap-2 mt-2">
          <button
            class="flex-1 inline-flex items-center justify-center rounded-xl bg-slate-800/90 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-sky-500/90 hover:text-slate-950 border border-slate-700/80 hover:border-sky-400/80 transition"
            onclick="updateStudentPrompt('${dept}','${cls}','${roll}')"
          >
            Rename
          </button>

          <button
            class="flex-1 inline-flex items-center justify-center rounded-xl bg-rose-600/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-500 border border-rose-500/70 transition"
            onclick="deleteStudent('${dept}','${cls}','${roll}')"
          >
            Delete
          </button>
        </div>
      </article>
    `;
  }

  const container = document.getElementById("studentList");
  if (!container) return;

  container.innerHTML =
    html ||
    `
    <div class="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-5 text-sm text-slate-300">
      No active students found for
      <span class="font-semibold text-indigo-300">${dept}</span> /
      <span class="font-semibold text-emerald-300">${cls}</span>.
      Try adding a student on the left, then reload this class.
    </div>
  `;
}

// ===============================
// UPDATE STUDENT
// ===============================
async function updateStudentPrompt(dept, cls, roll) {
  const newName = prompt("Enter new student name:");
  if (!newName || !newName.trim()) return;

  const res = await apiPut(`/students/update/${dept}/${cls}/${roll}`, {
    name: newName.trim(),
  });

  if (res.error) {
    alert(res.error);
    return;
  }

  alert("Student updated!");
  viewStudents();
}

// ===============================
// DELETE STUDENT
// ===============================
async function deleteStudent(dept, cls, roll) {
  if (!confirm(`Delete student with roll "${roll}" from ${dept} / ${cls}?\nThis will be recorded on the blockchain.`)) {
    return;
  }

  const res = await apiPut(`/students/delete/${dept}/${cls}/${roll}`);

  if (res.error) {
    alert(res.error);
    return;
  }

  alert("Student deleted!");
  viewStudents();
}
