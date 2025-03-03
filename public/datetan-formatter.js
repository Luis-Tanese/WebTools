const elements = {
    dateInput: document.getElementById("date-input"),
    formatInput: document.getElementById("format-input"),
    result: document.getElementById("result"),
    copyBtn: document.getElementById("copy-btn"),
    nowBtn: document.getElementById("now-btn"),
    formatBtns: document.querySelectorAll(".format-btn"),
    functionResult: document.getElementById("function-result"),
    copyFunctionBtn: document.getElementById("copy-function-btn"),
    useCurrentDateCheckbox: document.getElementById(
        "use-current-date-checkbox"
    ),
};

const setDefaultDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    elements.dateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
};

const formatDate = () => {
    const dateValue = elements.dateInput.value;
    const formatValue = elements.formatInput.value;

    if (!dateValue || !formatValue) {
        elements.result.textContent = "Please select a date and format";
        elements.functionResult.textContent = "Please select a date and format";
        return;
    }

    try {
        const date = new Date(dateValue);
        const formattedDate = dateTan(date, formatValue);
        elements.result.textContent = formattedDate;

        const useCurrentDate =
            elements.useCurrentDateCheckbox &&
            elements.useCurrentDateCheckbox.checked;
        if (useCurrentDate) {
            elements.functionResult.textContent = `dateTan(\n    new Date(),\n    "${formatValue}",\n    "en-us"\n)`;
        } else {
            const dateStr = date.toISOString();
            elements.functionResult.textContent = `dateTan(\n    new Date("${dateStr}"),\n    "${formatValue}",\n    "en-us"\n)`;
        }
    } catch (error) {
        elements.result.textContent =
            "Error formatting date. Check your format string.";
        elements.functionResult.textContent =
            "Error formatting date. Check your format string.";
    }
};

const copyResult = async () => {
    const resultText = elements.result.textContent;

    if (
        resultText &&
        resultText !== "Please select a date and format" &&
        resultText !== "Error formatting date. Check your format string."
    ) {
        try {
            await navigator.clipboard.writeText(resultText);
            alert("Formatted date copied to clipboard!");
        } catch (err) {
            alert("Failed to copy text to clipboard");
        }
    }
};

const copyFunctionCall = async () => {
    const functionText = elements.functionResult.textContent;

    if (
        functionText &&
        functionText !== "Please select a date and format" &&
        functionText !== "Error formatting date. Check your format string."
    ) {
        try {
            await navigator.clipboard.writeText(functionText);
            alert("Function call copied to clipboard!");
        } catch (err) {
            alert("Failed to copy function call to clipboard");
        }
    }
};

const setCurrentDateTime = () => {
    setDefaultDate();
    formatDate();
};

const init = () => {
    setDefaultDate();
    formatDate();

    elements.dateInput.addEventListener("change", formatDate);
    elements.formatInput.addEventListener("input", formatDate);
    elements.copyBtn.addEventListener("click", copyResult);
    elements.nowBtn.addEventListener("click", setCurrentDateTime);
    elements.copyFunctionBtn.addEventListener("click", copyFunctionCall);

    if (elements.useCurrentDateCheckbox) {
        elements.useCurrentDateCheckbox.addEventListener("change", formatDate);
    }

    elements.formatBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            elements.formatInput.value = btn.dataset.format;
            formatDate();
        });
    });
};

document.addEventListener("dateTanReady", init);
