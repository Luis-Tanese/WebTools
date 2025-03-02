const elements = {
    markdownInput: document.getElementById("markdown-input"),
    previewOutput: document.getElementById("preview-output"),
    copyHtmlBtn: document.getElementById("copy-html-btn"),
    copyMarkdownBtn: document.getElementById("copy-markdown-btn"),
    clearBtn: document.getElementById("clear-btn"),
};

const defaultMarkdown = `
# Markdown Editor

## Features
- Live preview
- Copy HTML or Markdown

## Formatting Examples
**Bold text** or __also bold__

*Italic text* or _also italic_

[Link example](https://example.com)

![Image/gif description](https://media.tenor.com/hwhZO-E0bO0AAAAM/silly.gif)

\`Inline code\`

\`\`\`javascript
// Code block
function silly() {
    console.log("I love silly gatos");
}
\`\`\`

> Blockquote example

- Unordered list item
- Another item
  - Nested item

1. Ordered list item
2. Another ordered item

Horizontal rule:
---
`;

elements.markdownInput.value = defaultMarkdown;

const renderMarkdown = () => {
    const markdown = elements.markdownInput.value;
    const html = marked.parse(markdown);
    elements.previewOutput.innerHTML = html;
};

elements.markdownInput.addEventListener("input", renderMarkdown);

elements.copyHtmlBtn.addEventListener("click", () => {
    const html = elements.previewOutput.innerHTML;
    navigator.clipboard
        .writeText(html)
        .then(() => alert("HTML copied to clipboard!"))
        .catch((err) => console.error("Failed to copy HTML: ", err));
});

elements.copyMarkdownBtn.addEventListener("click", () => {
    const markdown = elements.markdownInput.value;
    navigator.clipboard
        .writeText(markdown)
        .then(() => alert("Markdown copied to clipboard!"))
        .catch((err) => console.error("Failed to copy Markdown: ", err));
});

elements.clearBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear the editor?")) {
        elements.markdownInput.value = "";
        renderMarkdown();
    }
});

renderMarkdown();
