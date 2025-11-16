// =====================================================
// UI COMPONENTS – DARK GLASS THEME
// =====================================================

// Page Title
function title(t) {
  return `
    <h1 class="text-3xl md:text-4xl font-bold text-slate-50 mb-6 flex items-center gap-3">
      <span class="inline-block h-8 w-1.5 rounded-full bg-gradient-to-b from-indigo-400 to-purple-500"></span>
      ${t}
    </h1>
  `;
}

// Input Field (global consistent styling)
function inputField(id, placeholder) {
  return `
    <input
      id="${id}"
      placeholder="${placeholder}"
      class="w-full px-4 py-2.5 mb-3 rounded-xl bg-slate-800/60 text-slate-100 placeholder-slate-400
             border border-slate-700/80 shadow-inner shadow-black/20
             focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50"
      autocomplete="off"
    />
  `;
}

// Primary Button (gradient, glowing)
function primaryBtn(label, fn) {
  return `
    <button
      onclick="${fn}"
      class="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold
             text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
             shadow-md shadow-indigo-500/40
             hover:shadow-lg hover:from-indigo-400 hover:to-pink-400 transition"
    >
      ${label}
    </button>
  `;
}

// Card Component (glass card)
function card(content) {
  return `
    <div class="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-lg shadow-black/40 mb-4">
      ${content}
    </div>
  `;
}

// Blockchain Block View (Glass + Pretty JSON)
function blockView(b) {
  return card(`
    <div class="space-y-1 text-slate-200 text-sm">
      <p><span class="font-semibold text-indigo-300">Index:</span> ${b.index}</p>
      <p><span class="font-semibold text-indigo-300">Timestamp:</span> ${b.timestamp}</p>
      <p><span class="font-semibold text-indigo-300">Prev Hash:</span> <span class="font-mono text-slate-300">${b.prev_hash}</span></p>
      <p><span class="font-semibold text-indigo-300">Nonce:</span> ${b.nonce}</p>
      <p><span class="font-semibold text-indigo-300">Hash:</span> <span class="font-mono text-emerald-300">${b.hash}</span></p>

      <pre class="bg-slate-800/60 text-slate-200 border border-slate-700/80 rounded-xl p-3 mt-3 text-xs overflow-x-auto shadow-inner shadow-black/20">
TX: ${JSON.stringify(b.transactions, null, 2)}
      </pre>
    </div>
  `);
}
