import React, { useState, useCallback, useRef } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { FAVICON_SIZES, resizeImage, generateManifestJson, generateHtmlCode, createZip } from "../utils/faviconUtils";
import "../css/favicon-generator.css";

const acceptedInputTypes = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];

const FaviconGeneratorPage = () => {
	const { t } = useTranslation();
	const [originalImageFile, setOriginalImageFile] = useState(null);
	const [originalImageUrl, setOriginalImageUrl] = useState("");
	const [generatedFavicons, setGeneratedFavicons] = useState([]);
	const [htmlCode, setHtmlCode] = useState("");
	const [manifestJson, setManifestJson] = useState("");
	const [appName, setAppName] = useState("My App");
	const [themeColor, setThemeColor] = useState("#ffffff");
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");

	const fileInputRef = useRef(null);

	const clearMessages = () => {
		setError("");
		setSuccessMessage("");
	};

	const handleImageUpload = (event) => {
		clearMessages();
		const file = event.target.files[0];
		if (file && acceptedInputTypes.includes(file.type)) {
			setOriginalImageFile(file);
			setOriginalImageUrl(URL.createObjectURL(file));
			setGeneratedFavicons([]);
			setHtmlCode("");
			setManifestJson("");
		} else if (file) {
			setError("Invalid file type. Please upload PNG, JPG, SVG, or WEBP.");
			setOriginalImageFile(null);
			setOriginalImageUrl("");
		}
		event.target.value = null; // Reset file input
	};

	const triggerFileInput = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const handleGenerate = useCallback(async () => {
		if (!originalImageFile) {
			setError(t("fgErrorNoImage"));
			return;
		}
		clearMessages();
		setIsGenerating(true);
		setGeneratedFavicons([]);

		try {
			const favicons = [];
			for (const item of FAVICON_SIZES) {
				try {
					const blob = await resizeImage(originalImageFile, item.size, item.size);
					favicons.push({
						name: item.name,
						labelKey: item.labelKey,
						size: item.size,
						blob: blob,
						url: URL.createObjectURL(blob),
					});
				} catch (resizeError) {
					console.error(`Error resizing to ${item.size}x${item.size}:`, resizeError);
					favicons.push({
						name: item.name,
						labelKey: item.labelKey,
						size: item.size,
						blob: null,
						url: null,
						error: t("fgErrorGeneration"),
					});
				}
			}
			setGeneratedFavicons(favicons);

			const manifestContent = generateManifestJson(appName, themeColor);
			setManifestJson(manifestContent);

			const htmlContent = generateHtmlCode(themeColor);
			setHtmlCode(htmlContent);
		} catch (err) {
			console.error("Favicon generation error:", err);
			setError(t("fgErrorGeneration") + (err.message ? `: ${err.message}` : ""));
		} finally {
			setIsGenerating(false);
		}
	}, [originalImageFile, appName, themeColor, t]);

	const handleDownloadZip = async () => {
		if (generatedFavicons.length === 0 && !manifestJson) {
			setError("No files generated to download.");
			return;
		}
		clearMessages();
		const filesToZip = [...generatedFavicons.filter((f) => f.blob)];
		if (manifestJson) {
			filesToZip.push({ name: "site.webmanifest", content: manifestJson });
		}

		try {
			const zipBlob = await createZip(filesToZip);
			const link = document.createElement("a");
			link.href = URL.createObjectURL(zipBlob);
			link.download = "favicons.zip";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(link.href);
			setSuccessMessage(t("fgSuccessZipDownloaded"));
		} catch (err) {
			console.error("ZIP creation error:", err);
			setError("Error creating ZIP file.");
		}
	};

	const handleCopyHtml = () => {
		if (htmlCode) {
			navigator.clipboard
				.writeText(htmlCode)
				.then(() => setSuccessMessage(t("fgSuccessHtmlCopied")))
				.catch(() => setError("Failed to copy HTML code."));
			setTimeout(clearMessages, 3000);
		}
	};

	return (
		<div className="container fg-container">
			<header className="tool-header">
				<h1>{t("fgPageTitle")}</h1>
				<p className="subtitle">{t("fgPageSubtitle")}</p>
			</header>

			<main className="fg-main">
				<div
					className="fg-upload-section"
					onClick={triggerFileInput}
					role="button"
					tabIndex="0"
					onKeyPress={(e) => {
						if (e.key === "Enter" || e.key === " ") triggerFileInput();
					}}
				>
					<i className="fas fa-cloud-upload-alt"></i>
					<p>{t("fgUploadInstruction")}</p>
					<input
						type="file"
						id="favicon-upload-input"
						ref={fileInputRef}
						accept={acceptedInputTypes.join(",")}
						onChange={handleImageUpload}
						style={{ display: "none" }}
					/>
				</div>

				{originalImageUrl && (
					<div className="fg-preview-area">
						<h4>{t("fgSourceImagePreview")}</h4>
						<img src={originalImageUrl} alt="Source" className="fg-source-preview" />
					</div>
				)}

				{error && <p className="fg-status-message error">{error}</p>}
				{successMessage && <p className="fg-status-message success">{successMessage}</p>}

				<div className="fg-options-section">
					<h4>{t("fgOptionsHeader")}</h4>
					<div className="fg-option-group">
						<label htmlFor="app-name">{t("fgAppNameLabel")}</label>
						<input type="text" id="app-name" value={appName} onChange={(e) => setAppName(e.target.value)} />
					</div>
					<div className="fg-option-group">
						<label htmlFor="theme-color">{t("fgThemeColorLabel")}</label>
						<div className="fg-color-input-wrapper">
							<input
								type="color"
								id="theme-color-picker"
								value={themeColor}
								onChange={(e) => setThemeColor(e.target.value)}
							/>
							<input
								type="text"
								id="theme-color-text"
								value={themeColor}
								onChange={(e) => setThemeColor(e.target.value)}
								placeholder="#ffffff"
							/>
						</div>
					</div>
				</div>

				<button
					onClick={handleGenerate}
					className="tool-btn fg-generate-btn"
					disabled={!originalImageFile || isGenerating}
				>
					<i className={`fas ${isGenerating ? "fa-spinner fa-spin" : "fa-cogs"}`}></i>
					{isGenerating ? t("fgGenerating") : t("fgGenerateButton")}
				</button>

				{(generatedFavicons.length > 0 || htmlCode || manifestJson) && (
					<div className="fg-results-section">
						<h3>{t("fgResultsHeader")}</h3>
						<div className="fg-previews-grid">
							{generatedFavicons.map((item) => (
								<div key={item.name} className="fg-preview-item">
									{item.url ? (
										<img
											src={item.url}
											alt={t(item.labelKey)}
											title={`${t(item.labelKey)} (${item.size}x${item.size})`}
										/>
									) : (
										<div className="fg-preview-placeholder">
											<i className="fas fa-image"></i>
											<span>{item.error || t("fgPreviewNotAvailable")}</span>
										</div>
									)}
									<p>{t(item.labelKey)}</p>
									<span>({item.name})</span>
								</div>
							))}
						</div>

						<div className="fg-code-display">
							<label htmlFor="html-code-output">{t("fgHtmlCodeLabel")}</label>
							<textarea id="html-code-output" value={htmlCode} readOnly rows="8"></textarea>
							<button onClick={handleCopyHtml} className="tool-btn-secondary" disabled={!htmlCode}>
								<i className="fas fa-copy"></i> {t("fgCopyHtmlButton")}
							</button>
						</div>

						<div className="fg-code-display">
							<label htmlFor="manifest-json-output">{t("fgManifestJsonLabel")}</label>
							<textarea id="manifest-json-output" value={manifestJson} readOnly rows="10"></textarea>
						</div>
						<button
							onClick={handleDownloadZip}
							className="tool-btn fg-download-zip-btn"
							disabled={generatedFavicons.length === 0 && !manifestJson}
						>
							<i className="fas fa-file-archive"></i> {t("fgDownloadZipButton")}
						</button>
					</div>
				)}
			</main>
		</div>
	);
};

export default FaviconGeneratorPage;
