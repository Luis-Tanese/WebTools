import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { useToast } from "../hooks/useToast";
import "../css/base64-converter.css";

const arrayBufferToBase64 = (buffer) => {
	let binary = "";
	const bytes = new Uint8Array(buffer);
	bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
	return window.btoa(binary);
};
const formatBytes = (bytes, decimals = 2) => {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const Base64ConverterPage = () => {
	const { t, language } = useTranslation();
	const { showToast } = useToast();
	const [mode, setMode] = useState("encode");
	const [inputType, setInputType] = useState("text");
	const [inputText, setInputText] = useState("");
	const [inputFile, setInputFile] = useState(null);
	const [inputFileName, setInputFileName] = useState("");
	const [outputText, setOutputText] = useState("");
	const [outputFileInfo, setOutputFileInfo] = useState("");
	const [decodedBlob, setDecodedBlob] = useState(null);
	const [outputFileNameOption, setOutputFileNameOption] = useState("");

	const [copyDisabled, setCopyDisabled] = useState(true);
	const [downloadDisabled, setDownloadDisabled] = useState(true);

	const resetOutputs = useCallback(() => {
		setOutputText("");
		setOutputFileInfo(t("b64FileOutputPlaceholder"));
		setDecodedBlob(null);
		setOutputFileNameOption("");
		setCopyDisabled(true);
		setDownloadDisabled(true);
	}, [t]);

	useEffect(() => {
		resetOutputs();
	}, [mode, inputType, language, resetOutputs]);

	const handleFileChange = (event) => {
		const file = event.target.files[0];
		setInputFile(file);
		setInputFileName(file ? file.name : t("b64NoFileChosen"));
		resetOutputs();
	};

	const handleProcess = () => {
		resetOutputs();

		if (inputType === "text") {
			if (!inputText.trim()) {
				showToast(t("b64ErrorNoInput"), "error");
				return;
			}
			if (mode === "encode") {
				try {
					const utf8Bytes = new TextEncoder().encode(inputText);
					let binary = "";
					utf8Bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
					setOutputText(window.btoa(binary));
					setCopyDisabled(false);
				} catch (e) {
					setOutputText("");
					showToast(t("b64ErrorEncoding"), "error");
					console.error("Encoding error:", e);
				}
			} else {
				try {
					const binary = window.atob(inputText);
					const bytes = new Uint8Array(binary.length);
					for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

					setOutputText(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
					setCopyDisabled(false);

					setDecodedBlob(new Blob([bytes], { type: "text/plain;charset=utf-8" }));
					setOutputFileInfo(t("b64DecodedTextReady"));
					setDownloadDisabled(false);
				} catch (e) {
					setOutputText("");
					showToast(t("b64ErrorDecodingText"), "error");
					console.error("Decoding text error:", e);
				}
			}
		} else {
			if (!inputFile) {
				showToast(t("b64ErrorNoFileSelected"), "error");
				return;
			}
			const reader = new FileReader();
			reader.onload = (e) => {
				if (mode === "encode") {
					setOutputText(arrayBufferToBase64(e.target.result));
					setCopyDisabled(false);
				} else {
					try {
						let base64Data = e.target.result;
						if (base64Data.includes(",")) base64Data = base64Data.split(",")[1];
						base64Data = base64Data.trim();

						const binaryString = window.atob(base64Data);
						const bytes = new Uint8Array(binaryString.length);
						for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);

						const blob = new Blob([bytes.buffer], { type: inputFile.type || "application/octet-stream" });
						setDecodedBlob(blob);
						setOutputFileInfo(
							`${t("b64FileDecoded")} ${inputFile.name} (${formatBytes(blob.size)}, Type: ${blob.type})`
						);
						setDownloadDisabled(false);

						setOutputFileNameOption(
							inputFile.name.split(".")[0] + "_decoded." + (inputFile.name.split(".").pop() || "bin")
						);
					} catch (err) {
						setOutputFileInfo("");
						showToast(t("b64ErrorDecodingFile"), "error");
						console.error("Decoding file error:", err);
					}
				}
			};
			reader.onerror = () => showToast(t("b64ErrorReadingFile"), "error");
			if (mode === "encode") reader.readAsArrayBuffer(inputFile);
			else reader.readAsText(inputFile);
		}
	};

	const handleCopyOutput = () => {
		if (outputText) {
			navigator.clipboard
				.writeText(outputText)
				.then(() => showToast(t("b64CopiedSuccess"), "success"))
				.catch((err) => {
					showToast(t("qrCopiedError"), "error");
					console.error("Copy failed: ", err);
				});
		}
	};

	const handleDownloadFile = () => {
		if (decodedBlob) {
			const url = URL.createObjectURL(decodedBlob);
			const a = document.createElement("a");
			let filename = outputFileNameOption.trim();
			if (!filename) {
				const originalNameBase =
					inputType === "file" && inputFile ? inputFile.name.split(".")[0] : "decoded_output";
				const originalExt =
					inputType === "file" && inputFile && inputFile.name.includes(".")
						? inputFile.name.split(".").pop()
						: "bin";
				filename = `${originalNameBase}_decoded.${originalExt}`;
			}
			a.download = filename;
			a.href = url;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		}
	};

	return (
		<div className="container b64-container">
			<header className="tool-header">
				<h1>{t("b64PageTitle")}</h1>
				<p className="subtitle">{t("b64PageSubtitle")}</p>
			</header>
			<main className="b64-main">
				<div className="operation-toggle">
					<button
						onClick={() => setMode("encode")}
						className={`toggle-btn ${mode === "encode" ? "active" : ""}`}
					>
						{t("b64EncodeMode")}
					</button>
					<button
						onClick={() => setMode("decode")}
						className={`toggle-btn ${mode === "decode" ? "active" : ""}`}
					>
						{t("b64DecodeMode")}
					</button>
				</div>
				<div className="input-type-toggle">
					<span>{t("b64InputTypeLabel")}</span>
					<button
						onClick={() => setInputType("text")}
						className={`toggle-btn-small ${inputType === "text" ? "active" : ""}`}
					>
						{t("b64InputText")}
					</button>
					<button
						onClick={() => setInputType("file")}
						className={`toggle-btn-small ${inputType === "file" ? "active" : ""}`}
					>
						{t("b64InputFile")}
					</button>
				</div>

				<div className="b64-io-area">
					<div className="b64-pane input-pane">
						<h3>{t("b64InputHeader")}</h3>
						{inputType === "text" ? (
							<div id="text-input-section">
								<textarea
									id="b64-input-text"
									value={inputText}
									onChange={(e) => setInputText(e.target.value)}
									placeholder={
										mode === "encode"
											? t("b64InputTextPlaceholderEncode")
											: t("b64InputTextPlaceholderDecode")
									}
									rows="8"
								/>
							</div>
						) : (
							<div id="file-input-section">
								<label htmlFor="b64-input-file-react" className="file-upload-label">
									<i className="fas fa-upload"></i> {t("b64ChooseFile")}
								</label>
								<input
									type="file"
									id="b64-input-file-react"
									onChange={handleFileChange}
									style={{ display: "none" }}
								/>
								<p id="file-name-display">{inputFileName || t("b64NoFileChosen")}</p>
							</div>
						)}
					</div>
					<div className="b64-action">
						<button
							id="process-btn"
							onClick={handleProcess}
							className={`tool-btn ${mode === "encode" ? "process-btn-encode" : "process-btn-decode"}`}
						>
							<i className={`fas ${mode === "encode" ? "fa-cogs" : "fa-unlock-alt"}`}></i>
							{mode === "encode" ? t("b64EncodeAction") : t("b64DecodeAction")}
						</button>
					</div>
					<div className="b64-pane output-pane">
						<h3>{t("b64OutputHeader")}</h3>
						<div
							id="text-output-section"
							style={{
								display:
									mode === "encode" || (mode === "decode" && inputType === "text") ? "flex" : "none",
							}}
						>
							<textarea
								id="b64-output-text"
								value={outputText}
								readOnly
								placeholder={t("b64OutputTextPlaceholder")}
								rows="8"
							/>
							<button
								id="copy-output-btn"
								onClick={handleCopyOutput}
								title={t("b64CopyOutput")}
								disabled={copyDisabled}
							>
								<i className="fas fa-copy"></i>
							</button>
						</div>
						<div id="file-output-section" style={{ display: mode === "decode" ? "block" : "none" }}>
							<p id="file-output-info">{outputFileInfo}</p>
							<button
								id="download-file-btn"
								onClick={handleDownloadFile}
								className="tool-btn"
								disabled={downloadDisabled}
							>
								<i className="fas fa-download"></i> {t("b64DownloadFile")}
							</button>
						</div>
					</div>
				</div>
				<div className="options-section" style={{ display: mode === "decode" ? "block" : "none" }}>
					<h4>
						<i className="fas fa-cog"></i> {t("b64OptionsHeader")}
					</h4>
					<div className="option-item" id="filename-option">
						<label htmlFor="output-filename-react">{t("b64OutputFilenameLabel")}</label>
						<input
							type="text"
							id="output-filename-react"
							value={outputFileNameOption}
							onChange={(e) => setOutputFileNameOption(e.target.value)}
							placeholder={t("b64OutputFilenamePlaceholder")}
						/>
					</div>
				</div>
			</main>
		</div>
	);
};

export default Base64ConverterPage;
