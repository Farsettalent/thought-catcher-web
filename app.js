// Navigation
const screens = document.querySelectorAll(".screen");
const navButtons = document.querySelectorAll(".bottomNav button");

navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const target = btn.dataset.target;
        screens.forEach(s => s.classList.add("hidden"));
        document.getElementById(target).classList.remove("hidden");
    });
});

// Local storage
function getEntries() {
    return JSON.parse(localStorage.getItem("thoughts") || "[]");
}

function saveEntries(entries) {
    localStorage.setItem("thoughts", JSON.stringify(entries));
}

// Add entry
document.getElementById("saveBtn").addEventListener("click", () => {
    const text = document.getElementById("captureText").value.trim();
    const type = document.getElementById("typeSelect").value;
    const context = document.getElementById("contextSelect").value;
    const flag = document.getElementById("flagCheckbox").checked;

    if (!text) return;

    const entry = {
        id: Date.now(),
        text,
        type,
        context,
        flag,
        createdAt: Date.now()
    };

    const list = getEntries();
    list.unshift(entry);
    saveEntries(list);

    document.getElementById("captureText").value = "";
    alert("Saved");
});

// Load timeline
function renderTimeline() {
    const entries = getEntries();
    const list = document.getElementById("timelineList");
    list.innerHTML = "";

    entries.forEach(e => {
        const div = document.createElement("div");
        div.className = "entryCard";
        div.innerHTML = `
            <strong>${e.type}</strong><br>
            <em>${new Date(e.createdAt).toLocaleString()}</em><br><br>
            ${e.text}
        `;
        list.appendChild(div);
    });
}

setInterval(renderTimeline, 500);

// Speech to text
document.getElementById("micBtn").addEventListener("click", () => {
    const recognition = new (window.SpeechRecognition ||
        window.webkitSpeechRecognition)();

    recognition.lang = "en-GB";
    recognition.interimResults = false;

    recognition.onresult = event => {
        const text = event.results[0][0].transcript;
        document.getElementById("captureText").value += text + " ";
    };

    recognition.start();
});

// Export
document.getElementById("generateExport").addEventListener("click", () => {
    const entries = getEntries();
    const days = document.getElementById("exportRange").value;

    let filtered = entries;

    if (days !== "all") {
        const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
        filtered = entries.filter(e => e.createdAt >= cutoff);
    }

    const groups = {
        TRIGGER: [],
        MEMORY: [],
        QUESTION: [],
        INSIGHT: [],
        GENERAL: []
    };

    filtered.forEach(e => groups[e.type].push(e));

    let output = "";

    for (const type in groups) {
        if (groups[type].length > 0) {
            output += `=== ${type} ===\n\n`;
            groups[type].forEach(e => {
                output += `[${new Date(e.createdAt).toLocaleString()}]\n`;
                output += `${e.text}\n\n`;
            });
            output += "\n";
        }
    }

    document.getElementById("exportOutput").value = output;
});

// Copy export
document.getElementById("copyExport").addEventListener("click", () => {
    navigator.clipboard.writeText(
        document.getElementById("exportOutput").value
    );
    alert("Copied");
});
