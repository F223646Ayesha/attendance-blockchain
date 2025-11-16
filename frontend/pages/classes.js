// =====================================================
// SAFE API HELPERS (prevents page refresh & JSON errors)
// =====================================================

async function safeJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("NOT JSON RESPONSE FROM SERVER:", text);
    return { error: "Server returned invalid JSON." };
  }
}

async function apiGet(url) {
  try {
    const res = await fetch(API_BASE + url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    return safeJson(res);
  } catch (e) {
    console.error("GET ERROR:", e);
    return { error: "Network error" };
  }
}

async function apiPost(url, data) {
  try {
    const res = await fetch(API_BASE + url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return safeJson(res);
  } catch (e) {
    console.error("POST ERROR:", e);
    return { error: "Network error" };
  }
}

async function apiPut(url, data) {
  try {
    const res = await fetch(API_BASE + url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: data ? JSON.stringify(data) : "{}",
    });
    return safeJson(res);
  } catch (e) {
    console.error("PUT ERROR:", e);
    return { error: "Network error" };
  }
}

// ===============================
// PAGE RENDERER
// ===============================
async function loadClassesPage() {
  let html = `
    <section class="mb-8">
      <h1 class="text-3xl md:text-4xl font-bold text-slate-50 mb-2 flex items-center gap-2">
        <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-slate-950 text-xl font-bold shadow-lg shadow-emerald-400/40">
          C
        </span>
        Classes
      </h1>
      <p class="text-slate-300 max-w-2xl text-sm md:text-base">
        Manage class sections within each department. Every class is anchored to its parent department’s
        blockchain and later becomes the parent for student chains.
      </p>
    </section>

    <section class="grid gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.7fr)] items-start">
      <!-- Left: Add Class -->
      <div class="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-xl shadow-black/40">
        <h2 class="text-xl font-semibold text-slate-100 mb-3 flex items-center gap-2">
          <span class="h-7 w-1 rounded-full bg-gradient-to-b from-emerald-400 to-cyan-400"></span>
          Add Class
        </h2>
        <p class="text-xs text-slate-400 mb-4">
          Specify the department code and class name (e.g., SE &mdash; SE-3A). A new block will be mined and
          linked to the department chain.
        </p>
        <div class="space-y-4">
          ${inputField("classDept", "Department Code (e.g., SE, CS)")}
          ${inputField("className", "Class Name (e.g., 3A, 5B)")}

          <button
            onclick="addClass()"
            class="w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/40 hover:shadow-lg hover:from-emerald-400 hover:to-teal-400 transition"
          >
            + Add Class
          </button>
        </div>

        <div class="mt-6 rounded-xl bg-slate-900/70 border border-slate-800/80 px-4 py-3 text-xs text-slate-400 flex items-start gap-2">
          <span class="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300 text-[10px] border border-cyan-500/40">
            ℹ
          </span>
          <p>
            Class creation is recorded on the blockchain under the department’s chain,
            ensuring structural integrity when students and attendance blocks are added later.
          </p>
        </div>
      </div>

      <!-- Right: View Classes -->
      <div>
        <div class="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 md:p-6 mb-4">
          <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <h2 class="text-xl font-semibold text-slate-100 flex items-center gap-2">
                <span class="h-7 w-1 rounded-full bg-gradient-to-b from-violet-400 to-indigo-400"></span>
                View Classes by Department
              </h2>
              <p class="text-xs text-slate-400 mt-1">
                Enter a department code to see all active classes and their chain stats.
              </p>
            </div>
            <div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div class="flex-1">
                ${inputField("viewDept", "Department")}
              </div>
              <button
                onclick="viewClasses()"
                class="inline-flex items-center justify-center rounded-xl bg-slate-800/90 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-indigo-500/90 hover:text-white border border-slate-700/80 hover:border-indigo-400/80 transition"
              >
                Load Classes
              </button>
            </div>
          </div>
        </div>

        <div id="classList" class="grid gap-4 md:grid-cols-2"></div>
      </div>
    </section>
  `;

  app.innerHTML = html;
}

// ===============================
// ADD CLASS
// ===============================
async function addClass() {
  const deptInput = document.getElementById("classDept");
  const classInput = document.getElementById("className");

  const d = deptInput.value.trim().toUpperCase();
  const c = classInput.value.trim().toUpperCase();

  if (!d || !c) {
    alert("Both Department and Class fields are required.");
    if (!d) deptInput.focus();
    else classInput.focus();
    return;
  }

  const res = await apiPost("/classes/add", { deptName: d, className: c });

  if (res.error) {
    alert(res.error);
    return;
  }

  alert("Class added!");
  // Optionally keep the department typed in for viewing
  document.getElementById("viewDept").value = d;
  loadClassesPage();
}

// ===============================
// VIEW CLASSES
// ===============================
async function viewClasses() {
  const viewDeptInput = document.getElementById("viewDept");
  const d = viewDeptInput.value.trim().toUpperCase();
  if (!d) {
    alert("Please enter a department code to view its classes.");
    viewDeptInput.focus();
    return;
  }

  const list = await apiGet(`/classes/${d}`);

  if (list.error) {
    alert(list.error);
    return;
  }

  let cardsHtml = "";

  // list is expected to be an object: { "SE-3A": { chain: [...] }, ... }
  for (const classKey in list) {
    if (!Object.prototype.hasOwnProperty.call(list, classKey)) continue;

    const cls = list[classKey];
    const chainArr = Array.isArray(cls.chain) ? cls.chain : cls;

    if (!Array.isArray(chainArr) || chainArr.length === 0) continue;

    const lastBlock = chainArr[chainArr.length - 1];
    const t = lastBlock.transactions || {};

    // Ignore soft-deleted classes
    if (t.status === "deleted") continue;

    const displayName = t.newName || classKey;
    const createdAt = chainArr[0]?.timestamp || null;
    const chainLength = chainArr.length;

    const createdDate = createdAt
      ? new Date(createdAt).toISOString().split("T")[0]
      : "Unknown";

    cardsHtml += `
      <article class="group bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 md:p-5 hover:border-emerald-400/80 hover:shadow-lg hover:shadow-emerald-500/30 transition-all">
        <div class="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 class="text-lg font-semibold text-slate-50 group-hover:text-white">
              ${displayName}
            </h3>
            <p class="text-xs text-slate-400 mt-1">
              Department: <span class="text-emerald-300 font-medium">${d}</span>
            </p>
            <p class="text-xs text-slate-400 mt-0.5">
              Chain length: <span class="text-emerald-300 font-medium">${chainLength}</span> blocks
            </p>
            <p class="text-[11px] text-slate-500 mt-0.5">
              Created: <span class="font-mono">${createdDate}</span>
            </p>
          </div>
          <span class="inline-flex items-center rounded-full bg-sky-500/10 text-sky-300 px-3 py-1 text-[11px] font-medium border border-sky-500/40">
            Class Chain
          </span>
        </div>

        <div class="flex gap-2 mt-2">
          <button
            type="button"
            class="flex-1 inline-flex items-center justify-center rounded-xl bg-slate-800/90 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-emerald-500/90 hover:text-slate-950 border border-slate-700/80 hover:border-emerald-400/80 transition"
            onclick="updateClassPrompt('${d}','${classKey}')"
          >
            Rename
          </button>

          <button
            type="button"
            class="flex-1 inline-flex items-center justify-center rounded-xl bg-rose-600/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-500 border border-rose-500/70 transition"
            onclick="deleteClass('${d}','${classKey}')"
          >
            Delete
          </button>
        </div>
      </article>
    `;
  }

  const container = document.getElementById("classList");
  if (!container) return;

  container.innerHTML =
    cardsHtml ||
    `
    <div class="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-5 text-sm text-slate-300">
      No active classes found for department <span class="font-semibold text-emerald-300">${d}</span>.
      Try adding a class on the left, then reload this department.
    </div>
  `;
}

// ===============================
// UPDATE CLASS
// ===============================
async function updateClassPrompt(d, c) {
  const n = prompt("Enter new class name:", c);

  if (!n || !n.trim()) return;

  const res = await apiPut(`/classes/update/${d}/${c}`, {
    newName: n.trim().toUpperCase(),
  });

  if (res.error) {
    alert(res.error);
    return;
  }

  alert("Class updated!");
  viewClasses();
}

// ===============================
// DELETE CLASS
// ===============================
async function deleteClass(d, c) {
  if (!confirm(`Delete class "${c}" in department "${d}"?\nThis will be recorded on the blockchain.`)) {
    return;
  }

  const res = await apiPut(`/classes/delete/${d}/${c}`);

  if (res.error) {
    alert(res.error);
    return;
  }

  alert("Class deleted!");
  viewClasses();
}
