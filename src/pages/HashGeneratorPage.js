import React, { useState, useCallback, useRef } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { HASH_ALGORITHMS, generateHashForText, generateHashForFile } from "../utils/hashUtils";
import "../css/hash-generator.css";

const HashGeneratorPage = () => {
	const { t } = useTranslation();
	const [inputType, setInputType] = useState("text");
	const [textInput, setTextInput] = useState("");
	const [fileInput, setFileInput] = useState(null);
	const [fileName, setFileName] = useState("");
	const [selectedAlgorithm, setSelectedAlgorithm] = useState("SHA-256");
	const [hashOutput, setHashOutput] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");

	const fileInputRef = useRef(null);

	const clearMessages = () => {
		setError("");
		setSuccessMessage("");
	};

	const resetOutputs = useCallback(() => {
		setHashOutput("");
		clearMessages();
	}, []);

	const handleInputChange = (e) => {
		setTextInput(e.target.value);
		if (hashOutput) resetOutputs();
	};

	const handleFileChange = (event) => {
		const file = event.target.files[0];
		if (file) {
			setFileInput(file);
			setFileName(file.name);
			if (hashOutput) resetOutputs();
		} else {
			setFileInput(null);
			setFileName("");
		}
	};

	const handleInputTypeChange = (type) => {
		setInputType(type);
		setTextInput("");
		setFileInput(null);
		setFileName("");
		resetOutputs();
	};

	const handleGenerateHash = useCallback(async () => {
		clearMessages();
		setHashOutput("");

		if (inputType === "text" && !textInput.trim()) {
			setError(t("hgErrorNoInput"));
			return;
		}
		if (inputType === "file" && !fileInput) {
			setError(t("hgErrorNoInput"));
			return;
		}

		setIsGenerating(true);
		try {
			let hash;
			if (inputType === "text") {
				hash = await generateHashForText(textInput, selectedAlgorithm);
			} else {
				hash = await generateHashForFile(fileInput, selectedAlgorithm);
			}
			setHashOutput(hash);
		} catch (err) {
			console.error("Hashing error:", err);
			setError(t("hgErrorHashing") + (err.message ? `: ${err.message}` : ""));
		} finally {
			setIsGenerating(false);
		}
	}, [inputType, textInput, fileInput, selectedAlgorithm, t]);

	const handleCopyHash = () => {
		if (hashOutput) {
			navigator.clipboard
				.writeText(hashOutput)
				.then(() => {
					setSuccessMessage(t("hgCopiedSuccess"));
					setTimeout(clearMessages, 2000);
				})
				.catch(() => setError(t("hgCopiedError")));
		}
	};

	return (
		<div className="container hg-container">
			<header className="tool-header">
				<h1>{t("hgPageTitle")}</h1>
				<p className="subtitle">{t("hgPageSubtitle")}</p>
			</header>

			<main className="hg-main">
				<div className="hg-controls">
					<div className="hg-input-type-toggle">
						<span>{t("hgInputTypeLabel")}</span>
						<button
							onClick={() => handleInputTypeChange("text")}
							className={`toggle-btn-small ${inputType === "text" ? "active" : ""}`}
						>
							{t("hgInputText")}
						</button>
						<button
							onClick={() => handleInputTypeChange("file")}
							className={`toggle-btn-small ${inputType === "file" ? "active" : ""}`}
						>
							{t("hgInputFile")}
						</button>
					</div>

					<div className="hg-algorithm-selector">
						<label htmlFor="algorithm-select">{t("hgAlgorithmLabel")}</label>
						<select
							id="algorithm-select"
							value={selectedAlgorithm}
							onChange={(e) => {
								setSelectedAlgorithm(e.target.value);
								if (hashOutput) resetOutputs();
							}}
						>
							{Object.keys(HASH_ALGORITHMS).map((algKey) => (
								<option key={algKey} value={algKey}>
									{HASH_ALGORITHMS[algKey].name}
								</option>
							))}
						</select>
					</div>
				</div>

				{inputType === "text" ? (
					<div className="hg-input-area">
						<label htmlFor="text-input-hash">{t("hgTextInputLabel")}</label>
						<textarea
							id="text-input-hash"
							rows="6"
							placeholder={t("hgTextInputPlaceholder")}
							value={textInput}
							onChange={handleInputChange}
						/>
					</div>
				) : (
					<div className="hg-input-area hg-file-input-area">
						<label htmlFor="file-input-hash" className="file-upload-label">
							<i className="fas fa-upload"></i> {t("hgFileInputLabel")}
						</label>
						<input
							type="file"
							id="file-input-hash"
							ref={fileInputRef}
							onChange={handleFileChange}
							style={{ display: "none" }}
						/>
						<p id="file-name-display-hash">{fileName || t("hgNoFileChosen")}</p>
					</div>
				)}

				<button onClick={handleGenerateHash} className="tool-btn hg-generate-btn" disabled={isGenerating}>
					<i className={`fas ${isGenerating ? "fa-spinner fa-spin" : "fa-bolt"}`}></i>
					{isGenerating ? t("hgGenerating") : t("hgGenerateButtonText")}
				</button>

				{error && <p className="hg-status-message error">{error}</p>}
				{successMessage && <p className="hg-status-message success">{successMessage}</p>}

				{hashOutput && (
					<div className="hg-output-section">
						<h3>{t("hgResultsHeader")}</h3>
						<div className="hg-hash-display">
							<input type="text" value={hashOutput} readOnly />
							<button
								onClick={handleCopyHash}
								className="tool-btn-secondary hg-copy-btn"
								title={t("hgCopyButtonText")}
							>
								<i className="fas fa-copy"></i>
							</button>
						</div>
					</div>
				)}
			</main>
		</div>
	);
};

export default HashGeneratorPage;
