const elements = {
    colorPicker: document.getElementById("color-picker"),
    colorPreview: document.getElementById("color-preview"),
    hexInput: document.getElementById("hex-input"),
    rgbR: document.getElementById("rgb-r"),
    rgbG: document.getElementById("rgb-g"),
    rgbB: document.getElementById("rgb-b"),
    hslH: document.getElementById("hsl-h"),
    hslS: document.getElementById("hsl-s"),
    hslL: document.getElementById("hsl-l"),
    copyHexBtn: document.getElementById("copy-hex-btn"),
    copyRgbBtn: document.getElementById("copy-rgb-btn"),
    copyHslBtn: document.getElementById("copy-hsl-btn"),
    clearBtn: document.getElementById("clear-btn"),
};

const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
};

const rgbToHex = (r, g, b) => {
    return (
        "#" +
        [r, g, b]
            .map((x) => {
                const hex = x.toString(16);
                return hex.length === 1 ? "0" + hex : hex;
            })
            .join("")
    );
};

const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
        s,
        l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }

        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
    };
};

const hslToRgb = (h, s, l) => {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
    };
};

const updateColors = (source, value) => {
    let rgb, hex, hsl;

    switch (source) {
        case "hex":
            rgb = hexToRgb(value);
            if (rgb) {
                hex = value;
                hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            }
            break;

        case "rgb":
            rgb = value;
            hex = rgbToHex(rgb.r, rgb.g, rgb.b);
            hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            break;

        case "hsl":
            hsl = value;
            rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
            hex = rgbToHex(rgb.r, rgb.g, rgb.b);
            break;
    }

    if (rgb && hex && hsl) {
        elements.colorPicker.value = hex;
        elements.colorPreview.style.backgroundColor = hex;
        elements.hexInput.value = hex;
        elements.rgbR.value = rgb.r;
        elements.rgbG.value = rgb.g;
        elements.rgbB.value = rgb.b;
        elements.hslH.value = hsl.h;
        elements.hslS.value = hsl.s;
        elements.hslL.value = hsl.l;
    }
};

elements.colorPicker.addEventListener("input", (e) => {
    updateColors("hex", e.target.value);
});

elements.hexInput.addEventListener("input", (e) => {
    const hex = e.target.value.startsWith("#")
        ? e.target.value
        : "#" + e.target.value;
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
        updateColors("hex", hex);
    }
});

const rgbInputHandler = () => {
    const r = parseInt(elements.rgbR.value);
    const g = parseInt(elements.rgbG.value);
    const b = parseInt(elements.rgbB.value);

    if (
        !isNaN(r) &&
        !isNaN(g) &&
        !isNaN(b) &&
        r >= 0 &&
        r <= 255 &&
        g >= 0 &&
        g <= 255 &&
        b >= 0 &&
        b <= 255
    ) {
        updateColors("rgb", { r, g, b });
    }
};

const hslInputHandler = () => {
    const h = parseInt(elements.hslH.value);
    const s = parseInt(elements.hslS.value);
    const l = parseInt(elements.hslL.value);

    if (
        !isNaN(h) &&
        !isNaN(s) &&
        !isNaN(l) &&
        h >= 0 &&
        h <= 360 &&
        s >= 0 &&
        s <= 100 &&
        l >= 0 &&
        l <= 100
    ) {
        updateColors("hsl", { h, s, l });
    }
};

[elements.rgbR, elements.rgbG, elements.rgbB].forEach((input) => {
    input.addEventListener("input", rgbInputHandler);
});

[elements.hslH, elements.hslS, elements.hslL].forEach((input) => {
    input.addEventListener("input", hslInputHandler);
});

elements.copyHexBtn.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(elements.hexInput.value);
        alert("HEX color copied to clipboard!");
    } catch (err) {
        console.error("Failed to copy: ", err);
        alert("Failed to copy to clipboard");
    }
});

elements.copyRgbBtn.addEventListener("click", async () => {
    try {
        const r = elements.rgbR.value;
        const g = elements.rgbG.value;
        const b = elements.rgbB.value;
        await navigator.clipboard.writeText(`rgb(${r}, ${g}, ${b})`);
        alert("RGB color copied to clipboard!");
    } catch (err) {
        console.error("Failed to copy: ", err);
        alert("Failed to copy to clipboard");
    }
});

elements.copyHslBtn.addEventListener("click", async () => {
    try {
        const h = elements.hslH.value;
        const s = elements.hslS.value;
        const l = elements.hslL.value;
        await navigator.clipboard.writeText(`hsl(${h}, ${s}%, ${l}%)`);
        alert("HSL color copied to clipboard!");
    } catch (err) {
        console.error("Failed to copy: ", err);
        alert("Failed to copy to clipboard");
    }
});

elements.clearBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to reset the color?")) {
        updateColors("hex", "#EEE5DA");
    }
});

updateColors("hex", "#EEE5DA");
