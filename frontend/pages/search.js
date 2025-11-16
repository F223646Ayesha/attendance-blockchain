// ===============================
// SEARCH PAGE (Beautified)
// ===============================
async function loadSearchPage() {
  let html = `
    <section class="mb-8">
      <h1 class="text-3xl md:text-4xl font-bold text-slate-50 mb-2 flex items-center gap-2">
        <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 text-slate-950 text-xl font-bold shadow-lg shadow-sky-400/40">
          🔎
        </span>
        Search
      </h1>
      <p class="text-slate-300 max-w-3xl text-sm md:text-base">
        Quickly look up departments, classes, or students from a single search bar. Results update in real time
        as you type.
      </p>
    </section>

    <section class="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-xl shadow-black/40 mb-5">
      <label for="searchInput" class="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">
        Global search
      </label>
      <div class="relative">
        <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500 text-sm">
          🔍
        </span>
        <input
          id="searchInput"
          placeholder="Search by roll, name, class or department..."
          class="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800/60 text-slate-100 placeholder-slate-400
                 border border-slate-700/80 shadow-inner shadow-black/20
                 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400/60 text-sm md:text-base"
          onkeyup="performSearch()"
          autocomplete="off"
        />
      </div>
      <p class="text-[11px] text-slate-500 mt-2">
        Tip: type at least <span class="font-semibold text-slate-300">2 characters</span> to start searching.
      </p>
    </section>

    <section id="searchResults" class="space-y-4"></section>
  `;

  app.innerHTML = html;
}

// ===========================================
// UNIVERSAL SEARCH (students, classes, depts)
// ===========================================
async function performSearch() {
  const inputEl = document.getElementById("searchInput");
  const resultsEl = document.getElementById("searchResults");
  if (!inputEl || !resultsEl) return;

  const queryRaw = inputEl.value;
  const query = queryRaw.trim().toUpperCase();

  // Clear if empty or very short
  if (!query || query.length < 2) {
    resultsEl.innerHTML = "";
    return;
  }

  // Show lightweight "searching" state
  resultsEl.innerHTML = `
    <div class="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-4 text-sm text-slate-300 flex items-center gap-2">
      <span class="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-sky-400 border-t-transparent"></span>
      Searching for "<span class="font-semibold text-sky-300">${queryRaw}</span>"...
    </div>
  `;

  let resultsHTML = "";

  // Get departments list safely
  let deptResp = await apiGet("/departments/all");
  if (deptResp.error) {
    resultsEl.innerHTML = card(`
      <p class="text-sm text-rose-200">
        Failed to load data from server: ${deptResp.error}
      </p>
    `);
    return;
  }

  let allDepartments = Object.keys(deptResp || {});

  // 1️⃣ Search Departments
  for (const dept of allDepartments) {
    if (dept.toUpperCase().includes(query)) {
      resultsHTML += card(`
        <h2 class="text-lg font-semibold text-slate-50">Department: ${dept}</h2>
        <p class="text-xs text-slate-400 mt-1">Department match</p>
      `);
    }
  }

  // 2️⃣ Search Classes
  for (const dept of allDepartments) {
    const classes = await apiGet(`/classes/${dept}`);
    if (classes.error) continue;

    for (const className in classes) {
      if (!Object.prototype.hasOwnProperty.call(classes, className)) continue;

      if (className.toUpperCase().includes(query)) {
        resultsHTML += card(`
          <h2 class="text-lg font-semibold text-slate-50">Class: ${className}</h2>
          <p class="text-xs text-slate-400 mt-1">
            <span class="font-semibold text-emerald-300">Department:</span> ${dept}
          </p>
        `);
      }
    }
  }

  // 3️⃣ Search Students
  for (const dept of allDepartments) {
    const classes = await apiGet(`/classes/${dept}`);
    if (classes.error) continue;

    for (const className in classes) {
      if (!Object.prototype.hasOwnProperty.call(classes, className)) continue;

      const students = await apiGet(`/students/${dept}/${className}`);
      if (students.error) continue;

      for (const roll in students) {
        if (!Object.prototype.hasOwnProperty.call(students, roll)) continue;

        const studentObj = students[roll];
        const student = studentObj?.student || {};
        const name = (student.name || "").toUpperCase();
        const rollUpper = roll.toUpperCase();

        if (name.includes(query) || rollUpper.includes(query)) {
          resultsHTML += card(`
            <h2 class="text-lg font-semibold text-slate-50">${student.name || "Unknown Student"}</h2>
            <p class="text-xs text-slate-400 mt-1">
              <span class="font-semibold text-sky-300">Roll:</span> ${roll}
            </p>
            <p class="text-xs text-slate-400 mt-0.5">
              <span class="font-semibold text-emerald-300">Class:</span> ${className}
              <span class="text-slate-500 mx-1">•</span>
              <span class="font-semibold text-indigo-300">Department:</span> ${dept}
            </p>
          `);
        }
      }
    }
  }

  // If nothing matched
  if (!resultsHTML) {
    resultsHTML = card(`
      <p class="text-sm text-slate-300">
        No results found for "<span class="font-semibold text-sky-300">${queryRaw}</span>".
      </p>
    `);
  }

  resultsEl.innerHTML = resultsHTML;
}
