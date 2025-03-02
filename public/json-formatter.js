const elements = {
    jsonInput: document.getElementById("json-input"),
    jsonOutput: document.getElementById("json-output"),
    formatBtn: document.getElementById("format-btn"),
    minifyBtn: document.getElementById("minify-btn"),
    copyBtn: document.getElementById("copy-btn"),
    clearBtn: document.getElementById("clear-btn"),
    validationStatus: document.getElementById("validation-status"),
    modeRadios: document.querySelectorAll('input[name="mode"]'),
};

const getSelectedMode = () => {
    for (const radio of elements.modeRadios) {
        if (radio.checked) {
            return radio.value;
        }
    }
    return "parse";
};

const validateJSON = (input, mode) => {
    try {
        if (mode === "parse") {
            JSON.parse(input);
        } else {
            if (!/^[\[\{].*[\]\}]$/.test(input.trim())) {
                throw new Error("Invalid JSON object notation");
            }
            new Function(`return ${input}`)();
        }

        elements.validationStatus.textContent = "(Valid JSON)";
        elements.validationStatus.className = "valid";
        return true;
    } catch (error) {
        elements.validationStatus.textContent = `(Invalid JSON: ${error.message})`;
        elements.validationStatus.className = "invalid";
        return false;
    }
};

const formatJSON = (json, indent = 2) => {
    let formatted;

    try {
        if (typeof json === "string") {
            formatted = JSON.stringify(JSON.parse(json), null, indent);
        } else {
            formatted = JSON.stringify(json, null, indent);
        }

        formatted = formatted
            .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
            .replace(/: "([^"]*)"/g, ': <span class="json-string">"$1"</span>')
            .replace(/: (\d+)/g, ': <span class="json-number">$1</span>')
            .replace(
                /: (true|false)/g,
                ': <span class="json-boolean">$1</span>'
            )
            .replace(/: (null)/g, ': <span class="json-null">$1</span>');

        formatted = formatted.replace(
            /\[([^\]]+)\]/g,
            function (match, contents) {
                const coloredContents = contents
                    .split(",")
                    .map((item) => {
                        item = item.trim();
                        if (item.startsWith('"') && item.endsWith('"')) {
                            return `<span class="json-string">${item}</span>`;
                        } else if (/^-?\d+\.?\d*$/.test(item)) {
                            return `<span class="json-number">${item}</span>`;
                        } else if (item === "true" || item === "false") {
                            return `<span class="json-boolean">${item}</span>`;
                        } else if (item === "null") {
                            return `<span class="json-null">${item}</span>`;
                        }
                        return item;
                    })
                    .join(", ");

                return `[${coloredContents}]`;
            }
        );

        return formatted;
    } catch (error) {
        return json;
    }
};

const processJSON = (format = true) => {
    const input = elements.jsonInput.value.trim();
    if (!input) {
        elements.jsonOutput.innerHTML = "";
        elements.validationStatus.textContent = "";
        return;
    }

    const mode = getSelectedMode();
    const isValid = validateJSON(input, mode);

    if (!isValid) {
        elements.jsonOutput.textContent = input;
        return;
    }

    try {
        let result;

        if (mode === "parse") {
            const parsed = JSON.parse(input);
            result = format
                ? JSON.stringify(parsed, null, 2)
                : JSON.stringify(parsed);
        } else {
            const obj = new Function(`return ${input}`)();
            result = format
                ? JSON.stringify(obj, null, 2)
                : JSON.stringify(obj);
        }

        if (format) {
            elements.jsonOutput.innerHTML = formatJSON(result);
        } else {
            elements.jsonOutput.textContent = result;
        }
    } catch (error) {
        elements.jsonOutput.textContent = `Error: ${error.message}`;
    }
};

elements.formatBtn.addEventListener("click", () => {
    processJSON(true);
});

elements.minifyBtn.addEventListener("click", () => {
    processJSON(false);
});

elements.copyBtn.addEventListener("click", async () => {
    const textToCopy = elements.jsonOutput.textContent;

    try {
        await navigator.clipboard.writeText(textToCopy);
        alert("JSON copied to clipboard!");
    } catch (err) {
        console.error("Failed to copy: ", err);
        alert("Failed to copy to clipboard");
    }
});

elements.clearBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear the input?")) {
        elements.jsonInput.value = "";
        elements.jsonOutput.innerHTML = "";
        elements.validationStatus.textContent = "";
    }
});

elements.modeRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
        if (elements.jsonInput.value.trim()) {
            processJSON(true);
        }
    });
});

elements.jsonInput.addEventListener("dblclick", () => {
    if (!elements.jsonInput.value.trim()) {
        const mode = getSelectedMode();

        if (mode === "parse") {
            elements.jsonInput.value =
                '{"name":"Silly Cat","age":10000,"isActive":true,"hobbies":["doing evil things","coding","being silly"],"address":{"street":"123 Silly St","city":"Silly town","zip":"01110011 01101001 01101100 01101100 01111001"}}';
        } else {
            elements.jsonInput.value =
                '{\n  name: "Silly Cat",\n  age: 10000,\n  isActive: true,\n  hobbies: ["doing evil things","coding","being silly"],\n  address: {\n    street: "123 Silly St",\n    city: "Silly town",\n    zip: "01110011 01101001 01101100 01101100 01111001"\n  }\n}';
        }

        processJSON(true);
    }
});
