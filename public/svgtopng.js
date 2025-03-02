const elements = {
    uploadBox: document.getElementById("uploadBox"),
    fileInput: document.getElementById("fileInput"),
    preview: document.getElementById("preview"),
    scaleInput: document.getElementById("scale"),
    convertButton: document.getElementById("convertButton"),
    canvas: document.getElementById("canvas"),
};

let svgFiles = [];

const handleFiles = (files) => {
    const svgFilesPromises = Array.from(files)
        .filter((file) => file.type.includes("svg"))
        .map(
            (file) =>
                new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) =>
                        resolve({
                            name: file.name.replace(/\.svg$/i, ""),
                            content: e.target.result,
                        });
                    reader.onerror = reject;
                    reader.readAsText(file);
                })
        );

    Promise.all(svgFilesPromises)
        .then((results) => {
            svgFiles = results;
            elements.convertButton.disabled = results.length === 0;
            updatePreview();
        })
        .catch(() => alert("Error reading SVG files!"));
};

const updatePreview = () => {
    elements.preview.innerHTML = "";

    if (svgFiles.length === 0) {
        elements.preview.innerHTML = "<p>No files selected</p>";
        return;
    }

    const previewContainer = document.createElement("div");
    previewContainer.className = "preview-container";

    svgFiles.forEach((file) => {
        const previewItem = document.createElement("div");
        previewItem.className = "preview-item";

        const thumbnail = document.createElement("img");
        thumbnail.className = "thumbnail";
        thumbnail.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
            file.content
        )}`;

        const fileName = document.createElement("span");
        fileName.className = "file-name";
        fileName.textContent = file.name;

        previewItem.appendChild(thumbnail);
        previewItem.appendChild(fileName);
        previewContainer.appendChild(previewItem);
    });

    elements.preview.appendChild(previewContainer);
};

elements.fileInput.addEventListener("change", (e) =>
    handleFiles(e.target.files)
);

elements.uploadBox.addEventListener("click", () => elements.fileInput.click());

elements.uploadBox.addEventListener("dragover", (e) => {
    e.preventDefault();
    elements.uploadBox.classList.add("dragover");
});

elements.uploadBox.addEventListener("dragleave", () => {
    elements.uploadBox.classList.remove("dragover");
});

elements.uploadBox.addEventListener("drop", (e) => {
    e.preventDefault();
    elements.uploadBox.classList.remove("dragover");
    handleFiles(e.dataTransfer.files);
});

document.addEventListener("paste", (e) => {
    e.preventDefault();
    const files = Array.from(e.clipboardData.items)
        .filter((item) => item.kind === "file" && item.type.includes("svg"))
        .map((item) => item.getAsFile());

    if (files.length > 0) handleFiles(files);
    else alert("No SVG found in clipboard!");
});

const scaleSvg = (svgContent, scale) => {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
    const svgElement = svgDoc.documentElement;

    const width = parseFloat(svgElement.getAttribute("width") || "300");
    const height = parseFloat(svgElement.getAttribute("height") || "150");

    svgElement.setAttribute("width", width * scale);
    svgElement.setAttribute("height", height * scale);

    return new XMLSerializer().serializeToString(svgDoc);
};

elements.convertButton.addEventListener("click", async () => {
    const scale = parseFloat(elements.scaleInput.value);
    if (!svgFiles.length || isNaN(scale) || scale <= 0) {
        alert("Invalid scale or no files selected!");
        return;
    }

    for (const file of svgFiles) {
        try {
            const scaledSvg = scaleSvg(file.content, scale);
            const img = await new Promise((resolve, reject) => {
                const image = new Image();
                image.onload = () => resolve(image);
                image.onerror = reject;
                image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
                    scaledSvg
                )}`;
            });

            elements.canvas.width = img.width;
            elements.canvas.height = img.height;
            elements.canvas.getContext("2d").drawImage(img, 0, 0);

            const link = document.createElement("a");
            link.href = elements.canvas.toDataURL("image/png");
            link.download = `converted-${file.name}-${scale}x.png`;
            link.click();
        } catch (error) {
            console.error(`Error converting ${file.name}:`, error);
            alert(`Failed to convert ${file.name}`);
        }
    }
});
