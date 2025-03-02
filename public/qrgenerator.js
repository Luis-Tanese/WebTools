const elements = {
    canvas: document.getElementById("qrcode-canvas"),
    downloadBtn: document.getElementById("download-btn"),
    textInput: document.getElementById("text-input"),
};

const generateQRCode = (value) => {
    elements.downloadBtn.style.display = "none";
    elements.canvas.style.display = "none";

    if (value.trim() === "") return;

    QRCode.toCanvas(
        elements.canvas,
        value,
        { width: 150, margin: 2 },
        (error) => {
            if (error) {
                console.error(error);
                return;
            }

            elements.canvas.style.display = "block";
            elements.downloadBtn.style.display = "inline-block";
        }
    );
};

const downloadQRCode = () => {
    if (!elements.canvas) {
        alert("No QR code to download!");
        return;
    }

    const pngUrl = elements.canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = "qrcode.png";
    downloadLink.click();
};

elements.downloadBtn.addEventListener("click", downloadQRCode);

elements.textInput.addEventListener("input", (e) => {
    generateQRCode(e.target.value);
});
