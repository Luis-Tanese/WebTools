const elements = {
    tabBtns: document.querySelectorAll(".tab-btn"),
    tabContents: document.querySelectorAll(".tab-content"),

    inputTypeRadios: document.querySelectorAll('input[name="input-type"]'),
    textInputContainer: document.getElementById("text-input-container"),
    fileInputContainer: document.getElementById("file-input-container"),
    textInput: document.getElementById("text-input"),
    fileInput: document.getElementById("file-input"),
    fileDropArea: document.querySelector(".file-drop-area"),
    fileInfo: document.getElementById("file-info"),
    fileName: document.getElementById("file-name"),
    fileSize: document.getElementById("file-size"),
    fileType: document.getElementById("file-type"),
    encodeBtn: document.getElementById("encode-btn"),
    copyEncodeBtn: document.getElementById("copy-encode-btn"),
    clearEncodeBtn: document.getElementById("clear-encode-btn"),
    encodeOutput: document.getElementById("encode-output"),
    previewContainer: document.getElementById("preview-container"),
    previewContent: document.getElementById("preview-content"),

    outputTypeRadios: document.querySelectorAll('input[name="output-type"]'),
    decodeInput: document.getElementById("decode-input"),
    decodeBtn: document.getElementById("decode-btn"),
    copyDecodeBtn: document.getElementById("copy-decode-btn"),
    downloadBtn: document.getElementById("download-btn"),
    clearDecodeBtn: document.getElementById("clear-decode-btn"),
    decodeOutput: document.getElementById("decode-output"),
    decodePreviewContainer: document.getElementById("decode-preview-container"),
    decodePreviewContent: document.getElementById("decode-preview-content"),
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

elements.inputTypeRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
        if (radio.value === "text") {
            elements.textInputContainer.classList.remove("hidden");
            elements.fileInputContainer.classList.add("hidden");
        } else {
            elements.textInputContainer.classList.add("hidden");
            elements.fileInputContainer.classList.remove("hidden");
        }
    });
});

elements.fileDropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    elements.fileDropArea.classList.add("active");
});

elements.fileDropArea.addEventListener("dragleave", () => {
    elements.fileDropArea.classList.remove("active");
});

elements.fileDropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    elements.fileDropArea.classList.remove("active");
    handleFile(e.dataTransfer.files[0]);
});

elements.fileInput.addEventListener("change", (e) => {
    handleFile(e.target.files[0]);
});

function handleFile(file) {
    if (!file) return;

    elements.fileName.textContent = file.name;
    elements.fileSize.textContent = formatFileSize(file.size);
    elements.fileType.textContent = file.type || "Unknown type";
    elements.fileInfo.classList.remove("hidden");

    const reader = new FileReader();
    reader.onload = () => {
        elements.encodeOutput.value = reader.result.split(",")[1];
        updatePreview(file.type, reader.result);
    };
    reader.readAsDataURL(file);
}

function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function updatePreview(mimeType, dataUrl) {
    elements.previewContainer.classList.remove("hidden");
    elements.previewContent.innerHTML = "";

    if (mimeType.startsWith("image/")) {
        const img = document.createElement("img");
        img.src = dataUrl;
        elements.previewContent.appendChild(img);
    } else if (mimeType.startsWith("audio/")) {
        const audio = document.createElement("audio");
        audio.src = dataUrl;
        audio.controls = true;
        elements.previewContent.appendChild(audio);
    } else if (mimeType.startsWith("video/")) {
        const video = document.createElement("video");
        video.src = dataUrl;
        video.controls = true;
        elements.previewContent.appendChild(video);
    }
}

elements.encodeBtn.addEventListener("click", () => {
    const inputType = document.querySelector(
        'input[name="input-type"]:checked'
    ).value;

    if (inputType === "text") {
        const text = elements.textInput.value;
        elements.encodeOutput.value = btoa(text);
        elements.previewContainer.classList.add("hidden");
    }
});

elements.decodeBtn.addEventListener("click", () => {
    const outputType = document.querySelector(
        'input[name="output-type"]:checked'
    ).value;
    const input = elements.decodeInput.value.trim();

    try {
        if (outputType === "text") {
            elements.decodeOutput.value = atob(input);
            elements.downloadBtn.classList.add("hidden");
            elements.decodePreviewContainer.classList.add("hidden");
        } else {
            const binary = atob(input);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            const blob = new Blob([bytes]);
            elements.downloadBtn.classList.remove("hidden");
            elements.downloadBtn.onclick = () => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "decoded-file";
                a.click();
                URL.revokeObjectURL(url);
            };
        }
    } catch (error) {
        alert("Invalid Base64 string");
    }
});

elements.copyEncodeBtn.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(elements.encodeOutput.value);
        alert("Encoded text copied to clipboard!");
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
    elements.textInput.value = "";
    elements.encodeOutput.value = "";
    elements.fileInput.value = "";
    elements.fileInfo.classList.add("hidden");
    elements.previewContainer.classList.add("hidden");
});

elements.clearDecodeBtn.addEventListener("click", () => {
    elements.decodeInput.value = "";
    elements.decodeOutput.value = "";
    elements.downloadBtn.classList.add("hidden");
    elements.decodePreviewContainer.classList.add("hidden");
});
