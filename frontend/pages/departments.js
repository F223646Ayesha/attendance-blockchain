// ===============================
// LOAD DEPARTMENTS PAGE (Beautified)
// ===============================
async function loadDepartmentsPage() {
  let html = `
    <section class="mb-8">
      <h1 class="text-3xl md:text-4xl font-bold text-slate-50 mb-2 flex items-center gap-2">
        <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xl font-bold shadow-lg shadow-indigo-500/40">
          D
        </span>
        Departments
      </h1>
      <p class="text-slate-300 max-w-2xl text-sm md:text-base">
        Manage academic departments for the attendance blockchain. Each department anchors its own
        chain of classes and students, providing a tamper-evident root for all records.
      </p>
    </section>

    <section class="grid gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.7fr)] items-start">
      <!-- Left: Create -->
      <div class="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-xl shadow-black/40">
        <h2 class="text-xl font-semibold text-slate-100 mb-3 flex items-center gap-2">
          <span class="h-7 w-1 rounded-full bg-gradient-to-b from-indigo-400 to-purple-500"></span>
          Add Department
        </h2>
        <p class="text-xs text-slate-400 mb-4">
          New departments automatically receive a genesis block in their own chain, which later becomes
          the parent for all class and student chains.
        </p>
        <div class="space-y-4">
          ${inputField("deptName", "Department (e.g., SE, CS, BBA)")}
          <button
            onclick="addDepartment()"
            class="w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/40 hover:shadow-lg hover:from-indigo-400 hover:to-pink-400 transition"
          >
            + Add Department
          </button>
        </div>
        <div class="mt-6 rounded-xl bg-slate-900/70 border border-slate-800/80 px-4 py-3 text-xs text-slate-400 flex items-start gap-2">
          <span class="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] border border-emerald-500/40">
            ✓
          </span>
          <p>
            Every create, update, or delete action is recorded as a new block in the department chain,
            preserving a full, verifiable audit trail.
          </p>
        </div>
      </div>

      <!-- Right: List -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <h2 class="text-xl font-semibold text-slate-100 flex items-center gap-2">
              <span class="h-7 w-1 rounded-full bg-gradient-to-b from-emerald-400 to-cyan-400"></span>
              Existing Departments
            </h2>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[11px] px-2.5 py-1 rounded-full bg-slate-900/70 border border-slate-700/80 text-slate-300">
              Live on-chain view
            </span>
            <span class="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/50 text-emerald-300">
              Total: <span id="deptCount" class="font-semibold">0</span>
            </span>
          </div>
        </div>
        <div id="deptList" class="grid gap-4 md:grid-cols-2"></div>
      </div>
    </section>
  `;

  app.innerHTML = html;
  loadDepartmentList();
}

async function addDepartment() {
  const nameInput = document.getElementById("deptName");
  const name = nameInput.value.trim().toUpperCase();
  if (!name) {
    alert("Please enter a department name.");
    nameInput.focus();
    return;
  }

  await apiPost("/departments/add", { name });
  nameInput.value = "";
  loadDepartmentsPage();
}

async function loadDepartmentList() {
  let depts;
  try {
    depts = await apiGet("/departments/all");
    console.log("Departments data from backend:", depts);
  } catch (err) {
    console.error("Failed to load departments:", err);
    const container = document.getElementById("deptList");
    if (container) {
      container.innerHTML = `
        <div class="rounded-2xl bg-slate-900/70 border border-rose-700/60 p-5 text-sm text-rose-200">
          Error loading departments from the server. Please check if the backend is running.
        </div>
      `;
    }
    return;
  }

  let html = "";
  let activeCount = 0;

  // Case 1: backend returns an OBJECT like { "CS": {...}, "SE": {...} }
  if (!Array.isArray(depts)) {
    for (const key in depts) {
      if (!Object.prototype.hasOwnProperty.call(depts, key)) continue;
      const dept = depts[key];
      const cardHtml = renderDepartmentCard(key, dept);
      if (cardHtml) {
        html += cardHtml;
        activeCount++;
      }
    }
  } else {
    // Case 2: backend returns an ARRAY like [ { name: "CS", chain: [...] }, ... ]
    for (const dept of depts) {
      if (!dept) continue;
      const key = dept.name || dept.deptName || "Unknown";
      const cardHtml = renderDepartmentCard(key, dept);
      if (cardHtml) {
        html += cardHtml;
        activeCount++;
      }
    }
  }

  const container = document.getElementById("deptList");
  if (!container) return;

  container.innerHTML =
    html ||
    `
    <div class="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-5 text-sm text-slate-300">
      No active departments yet. Start by creating one on the left to initialize its blockchain.
    </div>
  `;

  const countSpan = document.getElementById("deptCount");
  if (countSpan) {
    countSpan.textContent = activeCount;
  }
}

function renderDepartmentCard(key, dept) {
  if (!dept || !Array.isArray(dept.chain) || dept.chain.length === 0) {
    return "";
  }

  const lastBlock = dept.chain[dept.chain.length - 1];
  const t = lastBlock.transactions || {};

  // Ignore soft-deleted departments
  if (t.status === "deleted") return "";

  const displayName = t.newName || key;
  const createdAt = dept.chain[0]?.timestamp || null;
  const chainLength = dept.chain.length;

  // Convert timestamp → YYYY-MM-DD
  const createdDate = createdAt
    ? new Date(createdAt).toISOString().split("T")[0]
    : "Unknown";

  return `
    <article class="group bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 md:p-5 hover:border-indigo-400/80 hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
      <div class="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 class="text-lg font-semibold text-slate-50 group-hover:text-white">
            ${displayName}
          </h3>
          <p class="text-xs text-slate-400 mt-1">
            Chain length: <span class="text-indigo-300 font-medium">${chainLength}</span> blocks
          </p>
          <p class="text-[11px] text-slate-500 mt-0.5">
            Created: <span class="font-mono">${createdDate}</span>
          </p>
        </div>
        <span class="inline-flex items-center rounded-full bg-emerald-500/10 text-emerald-300 px-3 py-1 text-[11px] font-medium border border-emerald-500/40">
          Root Chain
        </span>
      </div>

      <div class="flex gap-2 mt-2">
        <button
          class="flex-1 inline-flex items-center justify-center rounded-xl bg-slate-800/90 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-indigo-500/90 hover:text-white border border-slate-700/80 hover:border-indigo-400/80 transition"
          onclick="updateDepartment('${key}')"
        >
          Rename
        </button>
        <button
          class="flex-1 inline-flex items-center justify-center rounded-xl bg-rose-600/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-500 border border-rose-500/70 transition"
          onclick="deleteDepartment('${key}')"
        >
          Delete
        </button>
      </div>
    </article>
  `;
}

async function updateDepartment(oldName) {
  const newName = prompt("Enter new department name:", oldName);
  if (!newName || newName.trim() === "") return;

  await apiPut(`/departments/update/${oldName}`, { newName: newName.trim() });
  loadDepartmentsPage();
}

async function deleteDepartment(name) {
  const ok = confirm(
    `Are you sure you want to delete the department "${name}"?\n` +
      `This will be recorded on the blockchain as a delete operation.`
  );
  if (!ok) return;

  await apiPut(`/departments/delete/${name}`, {});
  loadDepartmentsPage();
}
