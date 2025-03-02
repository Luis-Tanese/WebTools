const elements = {
    textInput: document.getElementById("text-input"),
    wordCount: document.getElementById("word-count"),
    charCount: document.getElementById("char-count"),
    charNoSpaceCount: document.getElementById("char-no-space-count"),
    syllableCount: document.getElementById("syllable-count"),
    sentenceCount: document.getElementById("sentence-count"),
    paragraphCount: document.getElementById("paragraph-count"),
    keywordsContainer: document.getElementById("keywords-container"),
    copyBtn: document.getElementById("copy-btn"),
    clearBtn: document.getElementById("clear-btn"),
};

const countSyllables = (word) => {
    word = word.toLowerCase();
    word = word.replace(/[^a-z]/g, "");

    if (!word) return 0;

    if (word.length <= 3) return 1;

    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
    word = word.replace(/^y/, "");

    const syllables = word.match(/[aeiouy]{1,2}/g);
    return syllables ? syllables.length : 1;
};

const countTotalSyllables = (text) => {
    const words = text.match(/\b\w+\b/g) || [];
    return words.reduce((total, word) => total + countSyllables(word), 0);
};

const countSentences = (text) => {
    if (!text.trim()) return 0;

    const sentences = text.match(/[.!?]+(?:\s|$)/g) || [];
    return sentences.length;
};

const countParagraphs = (text) => {
    if (!text.trim()) return 0;
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    return paragraphs.length || 1;
};

const getTopKeywords = (text, limit = 10) => {
    if (!text.trim()) return [];

    const cleanText = text.toLowerCase().replace(/[^\w\s]/g, "");

    const words = cleanText.match(/\b\w+\b/g) || [];

    const stopWords = new Set([
        "a",
        "an",
        "the",
        "and",
        "or",
        "but",
        "is",
        "are",
        "was",
        "were",
        "be",
        "been",
        "being",
        "have",
        "has",
        "had",
        "do",
        "does",
        "did",
        "to",
        "at",
        "in",
        "on",
        "for",
        "with",
        "by",
        "about",
        "of",
        "from",
        "as",
        "into",
        "than",
        "that",
        "this",
        "these",
        "those",
        "it",
        "its",
        "i",
        "you",
        "he",
        "she",
        "we",
        "they",
        "them",
        "their",
        "our",
        "your",
    ]);

    const wordCounts = {};
    words.forEach((word) => {
        if (word.length > 1 && !stopWords.has(word)) {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
    });

    return Object.entries(wordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);
};

const updateStats = () => {
    const text = elements.textInput.value;

    const words = text.match(/\b\w+\b/g) || [];
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;

    elements.wordCount.textContent = words.length;
    elements.charCount.textContent = chars;
    elements.charNoSpaceCount.textContent = charsNoSpace;
    elements.syllableCount.textContent = countTotalSyllables(text);
    elements.sentenceCount.textContent = countSentences(text);
    elements.paragraphCount.textContent = countParagraphs(text);

    updateKeywords(text);
};

const updateKeywords = (text) => {
    const keywordsContainer = elements.keywordsContainer;
    keywordsContainer.innerHTML = "";

    const topKeywords = getTopKeywords(text);

    if (topKeywords.length === 0) {
        const noKeywords = document.createElement("p");
        noKeywords.className = "no-keywords";
        noKeywords.textContent = "Enter text to see top keywords";
        keywordsContainer.appendChild(noKeywords);
        return;
    }

    topKeywords.forEach(([word, count]) => {
        const keywordItem = document.createElement("div");
        keywordItem.className = "keyword-item";

        const keywordText = document.createElement("span");
        keywordText.textContent = word;

        const keywordCount = document.createElement("span");
        keywordCount.className = "keyword-count";
        keywordCount.textContent = count;

        keywordItem.appendChild(keywordText);
        keywordItem.appendChild(keywordCount);
        keywordsContainer.appendChild(keywordItem);
    });
};

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
        updateStats();
    }
});

elements.textInput.addEventListener("input", updateStats);

updateStats();
