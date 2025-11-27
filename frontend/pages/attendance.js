// ===============================
// ATTENDANCE PAGE (Beautified)
// ===============================
async function loadAttendancePage() {
  const today = new Date().toISOString().split("T")[0];

  let html = `
    <section class="mb-8">
      <h1 class="text-3xl md:text-4xl font-bold text-slate-50 mb-2 flex items-center gap-2">
        <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 text-xl font-bold shadow-lg shadow-amber-400/40">
          A
        </span>
        Mark Attendance
      </h1>
      <p class="text-slate-300 max-w-2xl text-sm md:text-base">
        Record daily attendance for a specific student. Each mark is stored as a mined block inside the
        student’s chain, making the ledger tamper-evident and auditable.
      </p>
    </section>

    <section class="grid gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)] items-start">
      <!-- Left: Attendance Form -->
      <div class="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-xl shadow-black/40">
        <h2 class="text-xl font-semibold text-slate-100 mb-3 flex items-center gap-2">
          <span class="h-7 w-1 rounded-full bg-gradient-to-b from-amber-400 to-orange-500"></span>
          Mark Today’s Attendance
        </h2>
        <p class="text-xs text-slate-400 mb-4">
          Use uppercase codes for department and class (e.g., <span class="font-mono text-slate-300">SE</span>,
          <span class="font-mono text-slate-300">SE-3A</span>). The system prevents duplicate marking for the same
          student on the same day.
        </p>

        <div class="space-y-3">
          ${inputField("adept", "Department (e.g., SE, CS)")}
          ${inputField("aclass", "Class (e.g., 3A, 5B)")}
          ${inputField("aroll", "Roll Number (e.g., 22F-3646)")}

          <div>
            <label for="astatus" class="block text-xs font-medium text-slate-300 mb-1">
              Status
            </label>
            <select
              id="astatus"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-800/60 text-slate-100 text-sm
                     border border-slate-700/80 shadow-inner shadow-black/20
                     focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-400/70"
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Leave">Leave</option>
            </select>
          </div>

          <button
            onclick="markAttendance()"
            class="w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r
                   from-amber-400 via-orange-500 to-rose-500 px-4 py-2.5 text-sm font-semibold
                   text-slate-950 shadow-md shadow-amber-400/40 hover:shadow-lg hover:from-amber-300 hover:to-rose-400 transition"
          >
            ✓ Mark Attendance
          </button>
        </div>

        <div class="mt-6 rounded-xl bg-slate-900/80 border border-slate-800/80 px-4 py-3 text-xs text-slate-400 flex items-start gap-2">
          <span class="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/15 text-amber-300 text-[10px] border border-amber-500/40">
            !
          </span>
          <p>
            Once marked, an <span class="text-amber-300 font-medium">ATTENDANCE_MARK</span> block is added to the
            student’s chain with today’s date (<span class="font-mono text-slate-200">${today}</span>) and the selected status.
          </p>
        </div>
      </div>

      <!-- Right: Info Panel -->
      <div class="space-y-4">
        <div class="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-xl shadow-black/40">
          <h3 class="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
            <span class="h-6 w-1 rounded-full bg-gradient-to-b from-emerald-400 to-cyan-400"></span>
            Today’s Snapshot
          </h3>
          <p class="text-sm text-slate-300 mb-2">
            Date: <span class="font-mono text-emerald-300">${today}</span>
          </p>
          <p class="text-xs text-slate-400">
            Attendance entries can be validated later through the blockchain explorer and validation pages.
            Any tampering with past records will break the chain and be immediately detectable.
          </p>
        </div>

        <div class="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 text-xs text-slate-400 shadow-xl shadow-black/40">
          <h3 class="text-sm font-semibold text-slate-100 mb-2 flex items-center gap-2">
            <span class="h-6 w-1 rounded-full bg-gradient-to-b from-indigo-400 to-purple-400"></span>
            Tips
          </h3>
          <ul class="list-disc list-inside space-y-1">
            <li>Make sure the student already exists under the selected department and class.</li>
            <li>Use consistent roll number format across the system.</li>
            <li>Use the <span class="text-emerald-300 font-medium">Explorer</span> page to inspect the student’s full attendance chain.</li>
          </ul>
        </div>
      </div>
    </section>
  `;

  app.innerHTML = html;
}

// ===============================
// MARK ATTENDANCE (logic unchanged, with tiny UX tweaks)
// ===============================
async function markAttendance() {
  const deptInput = document.getElementById("adept");
  const classInput = document.getElementById("aclass");
  const rollInput = document.getElementById("aroll");
  const statusSelect = document.getElementById("astatus");

  const dept = deptInput.value.trim().toUpperCase();
  const cls = classInput.value.trim().toUpperCase();
  const roll = rollInput.value.trim();
  const status = statusSelect.value;

  if (!dept || !cls || !roll) {
    alert("All fields are required!");
    if (!dept) deptInput.focus();
    else if (!cls) classInput.focus();
    else rollInput.focus();
    return;
  }

  const res = await apiPost("/attendance/mark", {
    deptName: dept,
    className: cls,
    roll,
    status,
  });

  if (res.error) {
    alert(res.error);
    return;
  }

  alert("Attendance marked successfully!");

  // Optional: keep department/class filled, just clear roll for faster marking
  rollInput.value = "";
  rollInput.focus();
}
