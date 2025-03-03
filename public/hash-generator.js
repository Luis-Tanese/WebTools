const elements = {
    textInput: document.getElementById("text-input"),
    md5Result: document.getElementById("md5-result"),
    sha1Result: document.getElementById("sha1-result"),
    sha256Result: document.getElementById("sha256-result"),
    sha512Result: document.getElementById("sha512-result"),
    sha3Result: document.getElementById("sha3-result"),
    ripemd160Result: document.getElementById("ripemd160-result"),
    copyHashBtns: document.querySelectorAll(".copy-hash-btn"),
    copyAllBtn: document.getElementById("copy-all-btn"),
    clearBtn: document.getElementById("clear-btn"),
    uppercaseCheckbox: document.getElementById("uppercase-checkbox"),
    encodingSelect: document.getElementById("encoding-select"),
};

const generateHashes = () => {
    const text = elements.textInput.value;
    const uppercase = elements.uppercaseCheckbox.checked;

    if (!text) {
        resetResults();
        return;
    }

    const md5Hash = CryptoJS.MD5(text).toString();
    const sha1Hash = CryptoJS.SHA1(text).toString();
    const sha256Hash = CryptoJS.SHA256(text).toString();
    const sha512Hash = CryptoJS.SHA512(text).toString();
    const sha3Hash = CryptoJS.SHA3(text).toString();
    const ripemd160Hash = CryptoJS.RIPEMD160(text).toString();

    elements.md5Result.textContent = uppercase
        ? md5Hash.toUpperCase()
        : md5Hash;
    elements.sha1Result.textContent = uppercase
        ? sha1Hash.toUpperCase()
        : sha1Hash;
    elements.sha256Result.textContent = uppercase
        ? sha256Hash.toUpperCase()
        : sha256Hash;
    elements.sha512Result.textContent = uppercase
        ? sha512Hash.toUpperCase()
        : sha512Hash;
    elements.sha3Result.textContent = uppercase
        ? sha3Hash.toUpperCase()
        : sha3Hash;
    elements.ripemd160Result.textContent = uppercase
        ? ripemd160Hash.toUpperCase()
        : ripemd160Hash;
};

const resetResults = () => {
    elements.md5Result.textContent = "Enter text above";
    elements.sha1Result.textContent = "Enter text above";
    elements.sha256Result.textContent = "Enter text above";
    elements.sha512Result.textContent = "Enter text above";
    elements.sha3Result.textContent = "Enter text above";
    elements.ripemd160Result.textContent = "Enter text above";
};

const copyHashToClipboard = async (hashType) => {
    const hashElements = {
        md5: elements.md5Result,
        sha1: elements.sha1Result,
        sha256: elements.sha256Result,
        sha512: elements.sha512Result,
        sha3: elements.sha3Result,
        ripemd160: elements.ripemd160Result,
    };

    const hashElement = hashElements[hashType];

    if (hashElement && hashElement.textContent !== "Enter text above") {
        try {
            await navigator.clipboard.writeText(hashElement.textContent);
            showCopyFeedback(hashType);
        } catch (err) {
            console.error("Failed to copy hash: ", err);
            alert("Failed to copy hash to clipboard");
        }
    }
};

const showCopyFeedback = (hashType) => {
    const button = document.querySelector(
        `.copy-hash-btn[data-hash="${hashType}"]`
    );
    const originalText = button.textContent;

    button.textContent = "Copied!";
    button.disabled = true;

    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
    }, 1500);
};

const copyAllHashes = async () => {
    const text = elements.textInput.value;

    if (!text) {
        return;
    }

    const allHashes = [
        `MD5: ${elements.md5Result.textContent}`,
        `SHA-1: ${elements.sha1Result.textContent}`,
        `SHA-256: ${elements.sha256Result.textContent}`,
        `SHA-512: ${elements.sha512Result.textContent}`,
        `SHA-3: ${elements.sha3Result.textContent}`,
        `RIPEMD-160: ${elements.ripemd160Result.textContent}`,
    ].join("\n\n");

    try {
        await navigator.clipboard.writeText(allHashes);
        alert("All hashes copied to clipboard!");
    } catch (err) {
        console.error("Failed to copy all hashes: ", err);
        alert("Failed to copy hashes to clipboard");
    }
};

const clearText = () => {
    if (confirm("Are you sure you want to clear the text?")) {
        elements.textInput.value = "";
        resetResults();
    }
};

elements.textInput.addEventListener("input", generateHashes);
elements.uppercaseCheckbox.addEventListener("change", generateHashes);
elements.encodingSelect.addEventListener("change", generateHashes);
elements.clearBtn.addEventListener("click", clearText);
elements.copyAllBtn.addEventListener("click", copyAllHashes);

elements.copyHashBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        const hashType = btn.getAttribute("data-hash");
        copyHashToClipboard(hashType);
    });
});

generateHashes();
