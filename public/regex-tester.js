const elements = {
    regexPattern: document.getElementById("regex-pattern"),
    testString: document.getElementById("test-string"),

    flagGlobal: document.getElementById("flag-global"),
    flagCaseInsensitive: document.getElementById("flag-case-insensitive"),
    flagMultiline: document.getElementById("flag-multiline"),
    flagDotall: document.getElementById("flag-dotall"),

    matchCount: document.getElementById("match-count"),
    matchesContainer: document.getElementById("matches-container"),
    highlightedText: document.getElementById("highlighted-text"),
    groupsContainer: document.getElementById("groups-container"),

    copyRegexBtn: document.getElementById("copy-regex-btn"),
    copyTextBtn: document.getElementById("copy-text-btn"),
    clearBtn: document.getElementById("clear-btn"),
    sampleBtn: document.getElementById("sample-btn"),
};

const samples = [
    {
        pattern: "\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b",
        flags: "i",
        text: "Contact us at silly@cat.com or support@cat.com.\nFor sales inquiries: sales.dept@cat.com",
    },
    {
        pattern: "\\b\\d{3}[-.]?\\d{3}[-.]?\\d{4}\\b",
        flags: "g",
        text: "Call us at 555-123-4567 or 8005551234.\nInternational: +1 (555) 234-5678",
    },
];

const updateRegex = () => {
    try {
        const pattern = elements.regexPattern.value;
        const text = elements.testString.value;

        if (!pattern || !text) {
            resetResults();
            return;
        }

        let flags = "";
        if (elements.flagGlobal.checked) flags += "g";
        if (elements.flagCaseInsensitive.checked) flags += "i";
        if (elements.flagMultiline.checked) flags += "m";
        if (elements.flagDotall.checked) flags += "s";

        const regex = new RegExp(pattern, flags);
        const matches = [];
        let match;

        if (flags.includes("g")) {
            while ((match = regex.exec(text)) !== null) {
                matches.push({
                    text: match[0],
                    index: match.index,
                    groups: match.slice(1),
                });
            }
        } else if ((match = regex.exec(text)) !== null) {
            matches.push({
                text: match[0],
                index: match.index,
                groups: match.slice(1),
            });
        }

        updateResults(matches, text);
    } catch (error) {
        showError(error.message);
    }
};

const updateResults = (matches, text) => {
    elements.matchCount.textContent = matches.length;

    if (matches.length === 0) {
        elements.matchesContainer.innerHTML =
            '<p class="no-matches">No matches found</p>';
    } else {
        elements.matchesContainer.innerHTML = matches
            .map(
                (match, i) => `
                <div class="match-item">
                    <span class="match-index">${i + 1}</span>
                    <span>${escapeHtml(match.text)}</span>
                </div>
            `
            )
            .join("");
    }

    updateHighlightedText(text, matches);
    updateGroups(matches);
};

const updateHighlightedText = (text, matches) => {
    if (matches.length === 0) {
        elements.highlightedText.textContent = text;
        return;
    }

    let html = "";
    let lastIndex = 0;

    matches.forEach((match) => {
        html += escapeHtml(text.substring(lastIndex, match.index));
        html += `<span class="highlight">${escapeHtml(match.text)}</span>`;
        lastIndex = match.index + match.text.length;
    });

    html += escapeHtml(text.substring(lastIndex));
    elements.highlightedText.innerHTML = html;
};

const updateGroups = (matches) => {
    if (!matches.length || !matches[0].groups.length) {
        elements.groupsContainer.innerHTML =
            '<p class="no-groups">No capture groups found</p>';
        return;
    }

    elements.groupsContainer.innerHTML = matches
        .map((match, matchIndex) =>
            match.groups
                .map(
                    (group, groupIndex) => `
                        <div class="group-item">
                            <div class="group-header">
                                <span>Match ${matchIndex + 1}, Group ${
                        groupIndex + 1
                    }</span>
                            </div>
                            <div class="group-content">${escapeHtml(
                                group
                            )}</div>
                        </div>
                    `
                )
                .join("")
        )
        .join("");
};

const resetResults = () => {
    elements.matchCount.textContent = "0";
    elements.matchesContainer.innerHTML =
        '<p class="no-matches">No matches found</p>';
    elements.highlightedText.textContent = elements.testString.value || "";
    elements.groupsContainer.innerHTML =
        '<p class="no-groups">No capture groups found</p>';
};

const showError = (message) => {
    elements.matchCount.textContent = "0";
    elements.matchesContainer.innerHTML = `<p class="no-matches">Error: ${escapeHtml(
        message
    )}</p>`;
    elements.highlightedText.textContent = elements.testString.value || "";
    elements.groupsContainer.innerHTML =
        '<p class="no-groups">No capture groups found</p>';
};

const escapeHtml = (text) => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
};

elements.regexPattern.addEventListener("input", updateRegex);
elements.testString.addEventListener("input", updateRegex);

elements.flagGlobal.addEventListener("change", updateRegex);
elements.flagCaseInsensitive.addEventListener("change", updateRegex);
elements.flagMultiline.addEventListener("change", updateRegex);
elements.flagDotall.addEventListener("change", updateRegex);

elements.copyRegexBtn.addEventListener("click", async () => {
    try {
        let flags = "";
        if (elements.flagGlobal.checked) flags += "g";
        if (elements.flagCaseInsensitive.checked) flags += "i";
        if (elements.flagMultiline.checked) flags += "m";
        if (elements.flagDotall.checked) flags += "s";

        const regexString = `/${elements.regexPattern.value}/${flags}`;
        await navigator.clipboard.writeText(regexString);
        alert("RegEx copied to clipboard!");
    } catch (err) {
        alert("Failed to copy to clipboard");
    }
});

elements.copyTextBtn.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(elements.testString.value);
        alert("Text copied to clipboard!");
    } catch (err) {
        alert("Failed to copy to clipboard");
    }
});

elements.clearBtn.addEventListener("click", () => {
    elements.regexPattern.value = "";
    elements.testString.value = "";
    resetResults();
});

elements.sampleBtn.addEventListener("click", () => {
    const sample = samples[Math.floor(Math.random() * samples.length)];
    elements.regexPattern.value = sample.pattern;

    elements.flagGlobal.checked = sample.flags.includes("g");
    elements.flagCaseInsensitive.checked = sample.flags.includes("i");
    elements.flagMultiline.checked = sample.flags.includes("m");
    elements.flagDotall.checked = sample.flags.includes("s");

    elements.testString.value = sample.text;
    updateRegex();
});

resetResults();
