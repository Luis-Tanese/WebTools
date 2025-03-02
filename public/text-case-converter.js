const elements = {
    textInput: document.getElementById("text-input"),
    charCount: document.getElementById("char-count"),
    lowercaseBtn: document.getElementById("lowercase-btn"),
    uppercaseBtn: document.getElementById("uppercase-btn"),
    titlecaseBtn: document.getElementById("titlecase-btn"),
    sentencecaseBtn: document.getElementById("sentencecase-btn"),
    camelcaseBtn: document.getElementById("camelcase-btn"),
    pascalcaseBtn: document.getElementById("pascalcase-btn"),
    snakecaseBtn: document.getElementById("snakecase-btn"),
    kebabcaseBtn: document.getElementById("kebabcase-btn"),
    constantcaseBtn: document.getElementById("constantcase-btn"),
    copyBtn: document.getElementById("copy-btn"),
    clearBtn: document.getElementById("clear-btn"),
};

const updateCharCount = () => {
    elements.charCount.textContent = elements.textInput.value.length;
};

const convertCase = {
    lowercase: (text) => text.toLowerCase(),

    uppercase: (text) => text.toUpperCase(),

    titlecase: (text) => {
        return text
            .toLowerCase()
            .replace(/(?:^|\s)\w/g, (match) => match.toUpperCase());
    },

    sentencecase: (text) => {
        return text
            .toLowerCase()
            .replace(/(^\w|\.\s+\w)/g, (match) => match.toUpperCase());
    },

    camelcase: (text) => {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, "")
            .replace(/\s+(.)/g, (_, char) => char.toUpperCase())
            .replace(/^[A-Z]/, (match) => match.toLowerCase());
    },

    pascalcase: (text) => {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, "")
            .replace(/\s+(.)/g, (_, char) => char.toUpperCase())
            .replace(/^[a-z]/, (match) => match.toUpperCase());
    },

    snakecase: (text) => {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, "")
            .replace(/\s+/g, "_");
    },

    kebabcase: (text) => {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, "")
            .replace(/\s+/g, "-");
    },

    constantcase: (text) => {
        return text
            .toUpperCase()
            .replace(/[^\w\s]/g, "")
            .replace(/\s+/g, "_");
    },
};

elements.lowercaseBtn.addEventListener("click", () => {
    elements.textInput.value = convertCase.lowercase(elements.textInput.value);
    updateCharCount();
});

elements.uppercaseBtn.addEventListener("click", () => {
    elements.textInput.value = convertCase.uppercase(elements.textInput.value);
    updateCharCount();
});

elements.titlecaseBtn.addEventListener("click", () => {
    elements.textInput.value = convertCase.titlecase(elements.textInput.value);
    updateCharCount();
});

elements.sentencecaseBtn.addEventListener("click", () => {
    elements.textInput.value = convertCase.sentencecase(
        elements.textInput.value
    );
    updateCharCount();
});

elements.camelcaseBtn.addEventListener("click", () => {
    elements.textInput.value = convertCase.camelcase(elements.textInput.value);
    updateCharCount();
});

elements.pascalcaseBtn.addEventListener("click", () => {
    elements.textInput.value = convertCase.pascalcase(elements.textInput.value);
    updateCharCount();
});

elements.snakecaseBtn.addEventListener("click", () => {
    elements.textInput.value = convertCase.snakecase(elements.textInput.value);
    updateCharCount();
});

elements.kebabcaseBtn.addEventListener("click", () => {
    elements.textInput.value = convertCase.kebabcase(elements.textInput.value);
    updateCharCount();
});

elements.constantcaseBtn.addEventListener("click", () => {
    elements.textInput.value = convertCase.constantcase(
        elements.textInput.value
    );
    updateCharCount();
});

elements.copyBtn.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(elements.textInput.value);
        alert("Text copied to clipboard!");
    } catch (err) {
        console.error("Failed to copy text: ", err);
        alert("Failed to copy text to clipboard");
    }
});

elements.clearBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear the text?")) {
        elements.textInput.value = "";
        updateCharCount();
    }
});

elements.textInput.addEventListener("input", updateCharCount);

updateCharCount();
