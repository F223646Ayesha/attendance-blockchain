const API_BASE = "https://bams-backend.onrender.com/"; 

async function apiGet(url) {
    const res = await fetch(API_BASE + url);
    return safeJson(res);
}

async function apiPost(url, data) {
    const res = await fetch(API_BASE + url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return safeJson(res);
}

async function apiPut(url, data) {
    const res = await fetch(API_BASE + url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return safeJson(res);
}

async function safeJson(res) {
    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("NOT JSON:", text);
        return { error: "Invalid JSON from server" };
    }
}
