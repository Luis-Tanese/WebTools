const elements = {
    leftPanel: document.getElementById("left-panel"),
    leftText: document.getElementById("left-text"),
    leftTextColor: document.getElementById("left-text-color"),
    leftTextHex: document.getElementById("left-text-hex"),
    leftBgColor: document.getElementById("left-bg-color"),
    leftBgHex: document.getElementById("left-bg-hex"),

    rightPanel: document.getElementById("right-panel"),
    rightText: document.getElementById("right-text"),
    rightTextColor: document.getElementById("right-text-color"),
    rightTextHex: document.getElementById("right-text-hex"),
    rightBgColor: document.getElementById("right-bg-color"),
    rightBgHex: document.getElementById("right-bg-hex"),

    contrastRatio: document.getElementById("contrast-ratio"),
    normalTextResult: document.getElementById("normal-text-result"),
    largeTextResult: document.getElementById("large-text-result"),
    uiComponentsResult: document.getElementById("ui-components-result"),

    swapBtn: document.getElementById("swap-btn"),
    resetBtn: document.getElementById("reset-btn"),
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

const calculateLuminance = (rgb) => {
    let r = rgb.r / 255;
    let g = rgb.g / 255;
    let b = rgb.b / 255;

    r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const calculateContrastRatio = (color1, color2) => {
    const lum1 = calculateLuminance(hexToRgb(color1));
    const lum2 = calculateLuminance(hexToRgb(color2));

    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
};

const updateContrastResults = (leftRatio, rightRatio) => {
    elements.contrastRatio.textContent = `Left: ${leftRatio.toFixed(
        2
    )}:1 | Right: ${rightRatio.toFixed(2)}:1`;

    const ratio = leftRatio;
    const normalTextPass = ratio >= 4.5;
    const normalTextPassAAA = ratio >= 7;
    const largeTextPass = ratio >= 3;
    const largeTextPassAAA = ratio >= 4.5;
    const uiComponentsPass = ratio >= 3;

    if (normalTextPassAAA) {
        elements.normalTextResult.textContent = "Pass (AA & AAA)";
        elements.normalTextResult.className = "result-value pass";
    } else if (normalTextPass) {
        elements.normalTextResult.textContent = "Pass (AA only)";
        elements.normalTextResult.className = "result-value pass";
    } else {
        elements.normalTextResult.textContent = "Fail";
        elements.normalTextResult.className = "result-value fail";
    }

    if (largeTextPassAAA) {
        elements.largeTextResult.textContent = "Pass (AA & AAA)";
        elements.largeTextResult.className = "result-value pass";
    } else if (largeTextPass) {
        elements.largeTextResult.textContent = "Pass (AA only)";
        elements.largeTextResult.className = "result-value pass";
    } else {
        elements.largeTextResult.textContent = "Fail";
        elements.largeTextResult.className = "result-value fail";
    }

    if (uiComponentsPass) {
        elements.uiComponentsResult.textContent = "Pass (AA & AAA)";
        elements.uiComponentsResult.className = "result-value pass";
    } else {
        elements.uiComponentsResult.textContent = "Fail";
        elements.uiComponentsResult.className = "result-value fail";
    }
};

const updateLeftPanel = () => {
    const textColor = elements.leftTextColor.value;
    const bgColor = elements.leftBgColor.value;

    elements.leftPanel.style.backgroundColor = bgColor;
    elements.leftText.style.color = textColor;
    elements.leftTextHex.value = textColor;
    elements.leftBgHex.value = bgColor;

    updateContrast();
};

const updateRightPanel = () => {
    const textColor = elements.rightTextColor.value;
    const bgColor = elements.rightBgColor.value;

    elements.rightPanel.style.backgroundColor = bgColor;
    elements.rightText.style.color = textColor;
    elements.rightTextHex.value = textColor;
    elements.rightBgHex.value = bgColor;

    updateContrast();
};

const updateContrast = () => {
    const leftTextColor = elements.leftTextColor.value;
    const leftBgColor = elements.leftBgColor.value;
    const leftContrast = calculateContrastRatio(leftTextColor, leftBgColor);

    const rightTextColor = elements.rightTextColor.value;
    const rightBgColor = elements.rightBgColor.value;
    const rightContrast = calculateContrastRatio(rightTextColor, rightBgColor);

    updateContrastResults(leftContrast, rightContrast);
};

const swapColors = () => {
    const leftTextColor = elements.leftTextColor.value;
    const leftBgColor = elements.leftBgColor.value;
    const rightTextColor = elements.rightTextColor.value;
    const rightBgColor = elements.rightBgColor.value;

    elements.leftTextColor.value = rightTextColor;
    elements.leftBgColor.value = rightBgColor;
    elements.rightTextColor.value = leftTextColor;
    elements.rightBgColor.value = leftBgColor;

    updateLeftPanel();
    updateRightPanel();
};

const resetColors = () => {
    elements.leftTextColor.value = "#FFFFFF";
    elements.leftBgColor.value = "#333333";
    elements.rightTextColor.value = "#333333";
    elements.rightBgColor.value = "#FFFFFF";

    updateLeftPanel();
    updateRightPanel();
};

elements.leftTextColor.addEventListener("input", updateLeftPanel);
elements.leftBgColor.addEventListener("input", updateLeftPanel);
elements.rightTextColor.addEventListener("input", updateRightPanel);
elements.rightBgColor.addEventListener("input", updateRightPanel);

elements.leftTextHex.addEventListener("input", (e) => {
    const hex = e.target.value.startsWith("#")
        ? e.target.value
        : "#" + e.target.value;
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
        elements.leftTextColor.value = hex;
        updateLeftPanel();
    }
});

elements.leftBgHex.addEventListener("input", (e) => {
    const hex = e.target.value.startsWith("#")
        ? e.target.value
        : "#" + e.target.value;
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
        elements.leftBgColor.value = hex;
        updateLeftPanel();
    }
});

elements.rightTextHex.addEventListener("input", (e) => {
    const hex = e.target.value.startsWith("#")
        ? e.target.value
        : "#" + e.target.value;
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
        elements.rightTextColor.value = hex;
        updateRightPanel();
    }
});

elements.rightBgHex.addEventListener("input", (e) => {
    const hex = e.target.value.startsWith("#")
        ? e.target.value
        : "#" + e.target.value;
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
        elements.rightBgColor.value = hex;
        updateRightPanel();
    }
});

elements.swapBtn.addEventListener("click", swapColors);
elements.resetBtn.addEventListener("click", resetColors);

updateLeftPanel();
updateRightPanel();
