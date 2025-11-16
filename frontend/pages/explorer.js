// ========================
// Blockchain Explorer Page (Beautified + Consistent Layout)
// ========================
async function loadExplorerPage() {
  let html = `
    <section class="mb-8">
      <h1 class="text-3xl md:text-4xl font-bold text-slate-50 mb-2 flex items-center gap-2">
        <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950 text-xl font-bold shadow-lg shadow-emerald-400/40">
          🔍
        </span>
        Blockchain Explorer
      </h1>
      <p class="text-slate-300 max-w-3xl text-sm md:text-base">
        Explore the full blockchain structure of departments, classes, and students.
        Every block includes its index, timestamp, hash, parent hash, nonce, and full transaction record.
      </p>
    </section>

    <section class="grid gap-6">
      <!-- Department Chain -->
      <div class="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 shadow-xl shadow-black/40">
        <h2 class="text-xl font-semibold text-slate-100 mb-3 flex items-center gap-2">
          <span class="h-7 w-1 rounded-full bg-gradient-to-b from-emerald-400 to-cyan-400"></span>
          Department Chain
        </h2>
        <p class="text-xs text-slate-400 mb-3">
          View the complete blockchain for a department. This contains all department-level operations.
        </p>
        <div class="flex flex-col md:flex-row gap-3">
          <div class="flex-1">
            ${inputField("expDept", "Department (e.g., SE, CS)")}
          </div>
          <button
            onclick="viewDeptChain()"
            class="md:w-40 w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/40 hover:shadow-lg hover:from-emerald-400 hover:to-cyan-400 transition"
          >
            View Chain
          </button>
        </div>
        <div id="expDeptResult" class="mt-5 space-y-4"></div>
      </div>

      <!-- Class Chain -->
      <div class="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 shadow-xl shadow-black/40">
        <h2 class="text-xl font-semibold text-slate-100 mb-3 flex items-center gap-2">
          <span class="h-7 w-1 rounded-full bg-gradient-to-b from-purple-400 to-pink-400"></span>
          Class Chain
        </h2>
        <p class="text-xs text-slate-400 mb-3">
          View the full blockchain of a class, including updates and student chain anchors.
        </p>
        <div class="flex flex-col md:flex-row gap-3">
          <div class="flex-1 grid md:grid-cols-2 gap-3">
            <div>${inputField("expClassDept", "Department")}</div>
            <div>${inputField("expClassName", "Class")}</div>
          </div>
          <button
            onclick="viewClassChain()"
            class="md:w-40 w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/40 hover:shadow-lg hover:from-emerald-400 hover:to-cyan-400 transition"
          >
            View Chain
          </button>
        </div>
        <div id="expClassResult" class="mt-5 space-y-4"></div>
      </div>

      <!-- Student Chain -->
      <div class="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 shadow-xl shadow-black/40">
        <h2 class="text-xl font-semibold text-slate-100 mb-3 flex items-center gap-2">
          <span class="h-7 w-1 rounded-full bg-gradient-to-b from-amber-400 to-orange-500"></span>
          Student Chain / Attendance Ledger
        </h2>
        <p class="text-xs text-slate-400 mb-3">
          Inspect a student's full attendance blockchain. Each attendance entry is a mined block.
        </p>
        <div class="flex flex-col md:flex-row gap-3">
          <div class="flex-1 grid md:grid-cols-3 gap-3">
            <div>${inputField("expStudDept", "Department")}</div>
            <div>${inputField("expStudClass", "Class")}</div>
            <div>${inputField("expStudRoll", "Roll Number")}</div>
          </div>
          <button
            onclick="viewExplorerStudentChain()"
            class="md:w-40 w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/40 hover:shadow-lg hover:from-emerald-400 hover:to-cyan-400 transition"
          >
            View Chain
          </button>
        </div>
        <div id="expStudResult" class="mt-5 space-y-4"></div>
      </div>
    </section>
  `;

  app.innerHTML = html;
}


// ======================
//       VIEWERS
// ======================

// --------- Department ---------
async function viewDeptChain() {
  const d = document.getElementById("expDept").value.trim().toUpperCase();
  if (!d) return alert("Enter department name");

  const chain = await apiGet(`/departments/chain/${d}`);
  if (chain.error) return alert(chain.error);

  renderChain("expDeptResult", chain);
}

// --------- Class ---------
async function viewClassChain() {
  const d = document.getElementById("expClassDept").value.trim().toUpperCase();
  const c = document.getElementById("expClassName").value.trim().toUpperCase();

  if (!d || !c) return alert("Enter department and class");

  const chain = await apiGet(`/classes/chain/${d}/${c}`);
  if (chain.error) return alert(chain.error);

  renderChain("expClassResult", chain);
}

// --------- Student ---------
async function viewExplorerStudentChain() {
  const d = document.getElementById("expStudDept").value.trim().toUpperCase();
  const c = document.getElementById("expStudClass").value.trim().toUpperCase();  // FIXED
  const r = document.getElementById("expStudRoll").value.trim();

  if (!d || !c || !r) return alert("Enter department, class and roll number");

  const chain = await apiGet(`/students/chain/${d}/${c}/${r}`);
  if (chain.error) return alert(chain.error);

  renderChain("expStudResult", chain);
}


// ======================
// HELPER – Renders blocks beautifully using blockView()
// ======================
function renderChain(containerId, chain) {
  const container = document.getElementById(containerId);

  if (!container) return;

  if (!chain || chain.length === 0) {
    container.innerHTML = `
      <div class="rounded-xl bg-slate-900/60 text-slate-300 border border-slate-700/80 p-4">
        No blocks found for this chain.
      </div>
    `;
    return;
  }

  let html = "";
  chain.forEach(b => (html += blockView(b)));

  container.innerHTML = html;
}
