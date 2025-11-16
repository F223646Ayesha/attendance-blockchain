// ================================
// LOAD VALIDATION PAGE (Beautified)
// ================================
async function loadValidationPage() {
  let html = `
    <section class="mb-8">
      <h1 class="text-3xl md:text-4xl font-bold text-slate-50 mb-2 flex items-center gap-2">
        <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-lime-500 text-slate-950 text-xl font-bold shadow-lg shadow-emerald-400/40">
          ✅
        </span>
        Blockchain Validation Report
      </h1>
      <p class="text-slate-300 max-w-3xl text-sm md:text-base">
        Run a full integrity check across all department, class, and student chains. Any broken hash,
        tampered block, or invalid link will be flagged here.
      </p>
    </section>

    <section class="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-xl shadow-black/40 mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div>
        <h2 class="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span class="h-6 w-1 rounded-full bg-gradient-to-b from-emerald-400 to-lime-400"></span>
          Run Full Validation
        </h2>
        <p class="text-xs text-slate-400 mt-1">
          This re-computes hashes and checks parent–child links for every chain in the system.
        </p>
      </div>
      <button
        onclick="runValidation()"
        class="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-lime-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/40 hover:shadow-lg hover:from-emerald-400 hover:to-lime-400 transition"
      >
        ▶ Run Validation
      </button>
    </section>

    <section id="validationResult" class="space-y-4">
      <div class="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 text-sm text-slate-300">
        No report yet. Click <span class="font-semibold text-emerald-300">Run Validation</span> to generate
        a full blockchain integrity summary.
      </div>
    </section>
  `;

  app.innerHTML = html;
}

// ================================
// RUN VALIDATION
// ================================
async function runValidation() {
  const container = document.getElementById("validationResult");
  if (!container) return;

  // Loading state
  container.innerHTML = `
    <div class="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-5 text-sm text-slate-300 flex items-center gap-3">
      <span class="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent"></span>
      Running validation across all chains. Please wait...
    </div>
  `;

  const data = await apiGet("/validate/all");
  if (data.error) {
    container.innerHTML = `
      <div class="rounded-2xl bg-slate-900/70 border border-rose-700/70 p-5 text-sm text-rose-200">
        Failed to run validation: ${data.error}
      </div>
    `;
    return;
  }

  const details = data.details || {};
  let html = "";

  // Optional overall badge if backend provides something like overallValid / allValid
  const overallFlag =
    typeof data.overallValid === "boolean"
      ? data.overallValid
      : typeof data.allValid === "boolean"
      ? data.allValid
      : null;

  if (overallFlag !== null) {
    html += `
      <div class="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-5 mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold text-slate-100 mb-1">Overall Blockchain Status</h2>
          <p class="text-xs text-slate-400">
            Combined integrity result across all departments, classes, and students.
          </p>
        </div>
        ${badge(overallFlag, true)}
      </div>
    `;
  }

  if (Object.keys(details).length === 0) {
    html += `
      <div class="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-5 text-sm text-slate-300">
        No departments found in the validation response.
      </div>
    `;
    container.innerHTML = html;
    return;
  }

  // Per-department breakdown
  for (const deptName in details) {
    if (!Object.prototype.hasOwnProperty.call(details, deptName)) continue;

    const dept = details[deptName];

    html += `
      <article class="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-xl shadow-black/40">
        <header class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
          <div>
            <h2 class="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold">
                D
              </span>
              Department: <span class="text-indigo-200">${deptName}</span>
            </h2>
            <p class="text-[11px] text-slate-400 mt-1">
              Root chain for all classes and students under this department.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[11px] text-slate-400">Dept Chain</span>
            ${badge(dept.departmentValid)}
          </div>
        </header>

        <section class="mt-3 rounded-xl bg-slate-900/80 border border-slate-800/80 p-4">
          <h3 class="text-sm font-semibold text-slate-100 mb-2 flex items-center gap-2">
            <span class="h-5 w-1 rounded-full bg-gradient-to-b from-emerald-400 to-cyan-400"></span>
            Classes
          </h3>
    `;

    const classes = dept.classes || {};
    if (Object.keys(classes).length === 0) {
      html += `
        <p class="text-xs text-slate-400">No classes found for this department.</p>
      `;
    } else {
      for (const className in classes) {
        if (!Object.prototype.hasOwnProperty.call(classes, className)) continue;

        const cls = classes[className];

        html += `
          <div class="mt-3 rounded-lg bg-slate-900/80 border border-slate-800/80 p-3">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <p class="text-sm font-semibold text-slate-100">
                  ${className}
                </p>
                <p class="text-[11px] text-slate-500">
                  Class chain & student anchors.
                </p>
              </div>
              <div class="flex flex-wrap items-center gap-2 text-[11px]">
                <span class="text-slate-400">Class Chain</span>
                ${badge(cls.classValid)}
                <span class="text-slate-500 mx-1">•</span>
                <span class="text-slate-400">Genesis Link</span>
                ${linkBadge(cls.genesisLinkOK)}
              </div>
            </div>

            <div class="mt-3 rounded-md bg-slate-900/80 border border-slate-800/80 p-3">
              <p class="text-[11px] font-semibold text-slate-200 mb-1">Students</p>
        `;

        const students = cls.students || {};
        if (Object.keys(students).length === 0) {
          html += `
            <p class="text-[11px] text-slate-500">
              No students found under this class in the validation report.
            </p>
          `;
        } else {
          for (const roll in students) {
            if (!Object.prototype.hasOwnProperty.call(students, roll)) continue;

            const st = students[roll];

            html += `
              <div class="flex flex-wrap items-center justify-between gap-2 text-[11px] py-1 border-b border-slate-800/80 last:border-b-0">
                <div class="flex items-center gap-2">
                  <span class="font-mono text-sky-300">${roll}</span>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-slate-400">Chain</span>
                  ${badge(st.studentValid)}
                  <span class="text-slate-500 mx-1">•</span>
                  <span class="text-slate-400">Link</span>
                  ${linkBadge(st.studentLinkOK)}
                </div>
              </div>
            `;
          }
        }

        html += `
            </div>
          </div>
        `;
      }
    }

    html += `
        </section>
      </article>
    `;
  }

  container.innerHTML = html;
}

// ================================
// BADGE COMPONENTS
// ================================
function badge(ok, large = false) {
  const base = large
    ? "px-3 py-1.5 text-xs md:text-sm rounded-full font-semibold inline-flex items-center gap-1 border"
    : "px-2.5 py-1 text-[11px] rounded-full font-semibold inline-flex items-center gap-1 border";

  if (ok) {
    return `
      <span class="${base} bg-emerald-500/10 text-emerald-300 border-emerald-500/50">
        <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
        VALID
      </span>
    `;
  }

  return `
    <span class="${base} bg-rose-500/10 text-rose-300 border-rose-500/50">
      <span class="h-2 w-2 rounded-full bg-rose-400"></span>
      INVALID
    </span>
  `;
}

function linkBadge(ok) {
  const base =
    "px-2.5 py-1 text-[11px] rounded-full font-semibold inline-flex items-center gap-1 border";

  if (ok) {
    return `
      <span class="${base} bg-emerald-500/10 text-emerald-300 border-emerald-500/50">
        <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
        OK
      </span>
    `;
  }

  return `
    <span class="${base} bg-rose-500/10 text-rose-300 border-rose-500/50">
      <span class="h-2 w-2 rounded-full bg-rose-400"></span>
      BROKEN
    </span>
  `;
}
