import React, { useState, useEffect, useCallback } from "react";
import { marked } from "marked";
import { useTranslation } from "../hooks/useTranslation";
import "../css/markdown-editor.css";

const sampleMarkdownText = `
# Markdown Editor

## Features
- Live preview
- Copy HTML or Markdown
- Load Sample Content

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
silly();
\`\`\`

> Blockquote example
> With another line.

- Unordered list item
- Another item
  - Nested item
    - Deeper item

1. Ordered list item
2. Another ordered item
   1. Nested ordered item

Horizontal rule:

---

Another paragraph.
`;

const MarkdownEditorPage = () => {
	const { t } = useTranslation();
	const [markdown, setMarkdown] = useState("");
	const [htmlPreview, setHtmlPreview] = useState("");

	const updatePreview = useCallback(() => {
		try {
			if (markdown.trim() === "") {
				setHtmlPreview("");
				return;
			}
			const parsedHtml = marked.parse(markdown, { gfm: true, breaks: true });
			setHtmlPreview(parsedHtml);
		} catch (e) {
			setHtmlPreview(`<p style="color: var(--color-error);">Error parsing Markdown.</p>`);
		}
	}, [markdown]);

	useEffect(() => {
		updatePreview();
	}, [updatePreview]);

	const handleLoadSample = () => {
		setMarkdown(sampleMarkdownText);
	};

	const handleCopyMarkdown = () => {
		navigator.clipboard
			.writeText(markdown)
			.then(() => alert(t("mdCopiedMarkdownSuccess")))
			.catch(() => alert(t("mdCopiedError")));
	};

	const handleCopyHtml = () => {
		navigator.clipboard
			.writeText(htmlPreview)
			.then(() => alert(t("mdCopiedHtmlSuccess")))
			.catch(() => alert(t("mdCopiedError")));
	};

	return (
		<div className="container md-container">
			<header className="tool-header">
				<h1>{t("mdPageTitle")}</h1>
				<p className="subtitle">{t("mdPageSubtitle")}</p>
			</header>
			<main className="md-main">
				<div className="md-toolbar">
					<button onClick={handleLoadSample} className="tool-btn-secondary">
						<i className="fas fa-file-alt"></i> {t("mdLoadSample")}
					</button>
					<button onClick={handleCopyMarkdown} className="tool-btn-secondary">
						<i className="fab fa-markdown"></i> {t("mdCopyMarkdown")}
					</button>
					<button onClick={handleCopyHtml} className="tool-btn-secondary">
						<i className="fas fa-code"></i> {t("mdCopyHtml")}
					</button>
				</div>
				<div className="editor-layout">
					<div className="editor-pane">
						<textarea
							id="markdown-input"
							placeholder={t("mdInputPlaceholder")}
							value={markdown}
							onChange={(e) => setMarkdown(e.target.value)}
						/>
					</div>
					<div className="preview-pane">
						<div
							id="markdown-preview"
							className="markdown-body"
							dangerouslySetInnerHTML={{ __html: htmlPreview }}
						/>
					</div>
				</div>
			</main>
		</div>
	);
};

export default MarkdownEditorPage;
