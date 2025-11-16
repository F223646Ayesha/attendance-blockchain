function loadPage(p){window.currentPage=p;if(pageHandlers[p])pageHandlers[p]();}
function dangerBtn(text, action) {
    return `
        <button onclick="${action}" 
            class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow">
            ${text}
        </button>
    `;
}
