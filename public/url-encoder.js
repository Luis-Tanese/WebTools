const elements = {
    tabBtns: document.querySelectorAll(".tab-btn"),
    tabContents: document.querySelectorAll(".tab-content"),

    encodeInput: document.getElementById("encode-input"),
    encodeBtn: document.getElementById("encode-btn"),
    copyEncodeBtn: document.getElementById("copy-encode-btn"),
    clearEncodeBtn: document.getElementById("clear-encode-btn"),
    encodeOutput: document.getElementById("encode-output"),

    decodeInput: document.getElementById("decode-input"),
    decodeBtn: document.getElementById("decode-btn"),
    copyDecodeBtn: document.getElementById("copy-decode-btn"),
    clearDecodeBtn: document.getElementById("clear-decode-btn"),
    decodeOutput: document.getElementById("decode-output"),
};

elements.tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        elements.tabBtns.forEach((b) => b.classList.remove("active"));
        elements.tabContents.forEach((c) => c.classList.remove("active"));
        btn.classList.add("active");
        document
            .getElementById(`${btn.dataset.tab}-tab`)
            .classList.add("active");
    });
});

elements.encodeBtn.addEventListener("click", () => {
    const input = elements.encodeInput.value;
    try {
        const encoded = encodeURIComponent(input);
        elements.encodeOutput.value = encoded;
    } catch (error) {
        alert("Error encoding URL: " + error.message);
    }
});

elements.decodeBtn.addEventListener("click", () => {
    const input = elements.decodeInput.value;
    try {
        const decoded = decodeURIComponent(input);
        elements.decodeOutput.value = decoded;
    } catch (error) {
        alert("Error decoding URL: " + error.message);
    }
});

elements.copyEncodeBtn.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(elements.encodeOutput.value);
        alert("Encoded URL copied to clipboard!");
    } catch (err) {
        alert("Failed to copy to clipboard");
    }
});

elements.copyDecodeBtn.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(elements.decodeOutput.value);
        alert("Decoded text copied to clipboard!");
    } catch (err) {
        alert("Failed to copy to clipboard");
    }
});

elements.clearEncodeBtn.addEventListener("click", () => {
    elements.encodeInput.value = "";
    elements.encodeOutput.value = "";
});

elements.clearDecodeBtn.addEventListener("click", () => {
    elements.decodeInput.value = "";
    elements.decodeOutput.value = "";
});

let encodeTimeout;
let decodeTimeout;

elements.encodeInput.addEventListener("input", () => {
    clearTimeout(encodeTimeout);
    encodeTimeout = setTimeout(() => {
        if (elements.encodeInput.value) {
            try {
                elements.encodeOutput.value = encodeURIComponent(
                    elements.encodeInput.value
                );
            } catch (error) {
                console.error("Auto-encode error:", error);
            }
        } else {
            elements.encodeOutput.value = "";
        }
    }, 300);
});

elements.decodeInput.addEventListener("input", () => {
    clearTimeout(decodeTimeout);
    decodeTimeout = setTimeout(() => {
        if (elements.decodeInput.value) {
            try {
                elements.decodeOutput.value = decodeURIComponent(
                    elements.decodeInput.value
                );
            } catch (error) {
                console.error("Auto-decode error:", error);
            }
        } else {
            elements.decodeOutput.value = "";
        }
    }, 300);
});

elements.encodeInput.addEventListener("paste", () => {
    setTimeout(() => {
        try {
            elements.encodeOutput.value = encodeURIComponent(
                elements.encodeInput.value
            );
        } catch (error) {
            console.error("Paste encode error:", error);
        }
    }, 0);
});

elements.decodeInput.addEventListener("paste", () => {
    setTimeout(() => {
        try {
            elements.decodeOutput.value = decodeURIComponent(
                elements.decodeInput.value
            );
        } catch (error) {
            console.error("Paste decode error:", error);
        }
    }, 0);
});

elements.encodeInput.addEventListener("dblclick", () => {
    if (!elements.encodeInput.value) {
        elements.encodeInput.value =
            "https://example.com/path?name=John Doe&id=123&q=search term";
        elements.encodeOutput.value = encodeURIComponent(
            elements.encodeInput.value
        );
    }
});

elements.decodeInput.addEventListener("dblclick", () => {
    if (!elements.decodeInput.value) {
        elements.decodeInput.value =
            "https%3A%2F%2Fexample.com%2Fpath%3Fname%3DJohn%20Doe%26id%3D123%26q%3Dsearch%20term";
        elements.decodeOutput.value = decodeURIComponent(
            elements.decodeInput.value
        );
    }
});
