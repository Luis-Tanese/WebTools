import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "../hooks/useTranslation";
import "../css/image-converter.css";

const acceptedInputTypes = [
	"image/jpeg",
	"image/png",
	"image/svg+xml",
	"image/webp",
	"image/bmp",
	"image/jfif",
	"image/pjpeg",
];
const outputFormats = [
	{ value: "image/png", label: "PNG" },
	{ value: "image/jpeg", label: "JPEG" },
	{ value: "image/webp", label: "WEBP" },
];

const formatBytes = (bytes, decimals = 2) => {
	if (!bytes || bytes === 0) return "0 Bytes";
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const ImageConverterPage = () => {
	const { t } = useTranslation();
	const [files, setFiles] = useState([]);
	const [targetFormat, setTargetFormat] = useState("image/png");
	const [quality, setQuality] = useState(0.92);
	const [isProcessing, setIsProcessing] = useState(false);
	const fileInputRef = useRef(null);

	const handleFileChange = (event) => {
		const selectedFiles = Array.from(event.target.files);
		const newImageFiles = selectedFiles
			.filter((file) => acceptedInputTypes.includes(file.type) || file.name.toLowerCase().endsWith(".jfif"))
			.map((file) => ({
				originalFile: file,
				id: `${file.name}-${file.lastModified}-${Math.random()}`,
				previewUrl: URL.createObjectURL(file),
				status: "pending",
				convertedUrl: null,
				convertedFileName: null,
				error: null,
			}));
		setFiles((prevFiles) => [...prevFiles, ...newImageFiles]);
	};

	const triggerFileInput = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const updateFileStatus = (fileId, newStatus, data = {}) => {
		setFiles((prevFiles) => prevFiles.map((f) => (f.id === fileId ? { ...f, status: newStatus, ...data } : f)));
	};

	const convertImage = useCallback(
		async (fileObject) => {
			updateFileStatus(fileObject.id, "processing");
			const { originalFile } = fileObject;

			return new Promise((resolve) => {
				const reader = new FileReader();
				reader.onload = (e) => {
					const img = new Image();
					img.onload = () => {
						const canvas = document.createElement("canvas");
						if (originalFile.type === "image/svg+xml") {
							const naturalWidth = img.naturalWidth || img.width;
							const naturalHeight = img.naturalHeight || img.height;
							canvas.width = naturalWidth > 0 ? naturalWidth : 300;
							canvas.height =
								naturalHeight > 0
									? naturalHeight
									: naturalWidth > 0
									? (300 * naturalHeight) / naturalWidth
									: 300;
						} else {
							canvas.width = img.naturalWidth;
							canvas.height = img.naturalHeight;
						}

						const ctx = canvas.getContext("2d");
						if (
							targetFormat === "image/jpeg" &&
							(originalFile.type === "image/png" ||
								originalFile.type === "image/svg+xml" ||
								originalFile.type === "image/bmp")
						) {
							ctx.fillStyle = "#FFFFFF";
							ctx.fillRect(0, 0, canvas.width, canvas.height);
						}
						ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

						try {
							let dataUrl;
							let qualityParam =
								targetFormat === "image/jpeg" || targetFormat === "image/webp"
									? parseFloat(quality)
									: undefined;
							if (isNaN(qualityParam) || qualityParam < 0.01 || qualityParam > 1) qualityParam = 0.92;

							if (targetFormat === "image/svg+xml" && originalFile.type !== "image/svg+xml") {
								const rasterBase64 = canvas.toDataURL(
									originalFile.type === "image/png" ? "image/png" : "image/jpeg",
									qualityParam
								);
								const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">
                                <image href="${rasterBase64}" width="${canvas.width}" height="${canvas.height}" />
                            </svg>`;
								dataUrl = `data:image/svg+xml;base64,${window.btoa(
									unescape(encodeURIComponent(svgContent))
								)}`;
							} else if (targetFormat === "image/svg+xml" && originalFile.type === "image/svg+xml") {
								dataUrl = e.target.result;
							} else {
								dataUrl = canvas.toDataURL(targetFormat, qualityParam);
							}

							const originalNameBase =
								originalFile.name.substring(0, originalFile.name.lastIndexOf(".")) || originalFile.name;
							const newExtension = targetFormat.split("/")[1].replace("+xml", "");

							updateFileStatus(fileObject.id, "converted", {
								convertedUrl: dataUrl,
								convertedFileName: `${originalNameBase}.${newExtension}`,
							});
							resolve();
						} catch (conversionError) {
							console.error("Conversion error:", conversionError);
							updateFileStatus(fileObject.id, "error", { error: t("icErrorConversion") });
							resolve();
						}
					};
					img.onerror = () => {
						console.error("Image load error for conversion for file:", originalFile.name);
						updateFileStatus(fileObject.id, "error", { error: t("icErrorImageLoad") });
						resolve();
					};
					img.src = e.target.result;
				};
				reader.onerror = () => {
					console.error("File read error for file:", originalFile.name);
					updateFileStatus(fileObject.id, "error", { error: t("icErrorFileRead") });
					resolve();
				};
				reader.readAsDataURL(originalFile);
			});
		},
		[targetFormat, quality, t]
	);

	const handleConvertAll = async () => {
		if (files.length === 0) {
			alert(t("icErrorNoFiles"));
			return;
		}
		setIsProcessing(true);
		const conversionPromises = files.map((fileObject) => {
			if (fileObject.status !== "converted" && fileObject.status !== "processing") {
				return convertImage(fileObject);
			}
			return Promise.resolve();
		});
		await Promise.all(conversionPromises);
		setIsProcessing(false);
	};

	useEffect(() => {
		const currentFiles = files;
		return () => {
			currentFiles.forEach((file) => {
				if (file.previewUrl && file.previewUrl.startsWith("blob:")) {
					URL.revokeObjectURL(file.previewUrl);
				}
			});
		};
	}, [files]);

	return (
		<div className="container ic-container">
			<header className="tool-header">
				<h1>{t("icPageTitle")}</h1>
				<p className="subtitle">{t("icPageSubtitle")}</p>
			</header>

			<main className="ic-main">
				<div
					className="ic-upload-section"
					onClick={triggerFileInput}
					role="button"
					tabIndex="0"
					onKeyPress={(e) => {
						if (e.key === "Enter" || e.key === " ") triggerFileInput();
					}}
				>
					<i className="fas fa-cloud-upload-alt"></i>
					<p>{t("icUploadInstruction")}</p>
					<input
						type="file"
						id="image-upload-input"
						ref={fileInputRef}
						multiple
						accept={acceptedInputTypes.join(",")}
						onChange={handleFileChange}
						style={{ display: "none" }}
					/>
				</div>

				{files.length > 0 && (
					<>
						<div className="ic-options-section">
							<div className="option-group">
								<label htmlFor="target-format-select">{t("icTargetFormatLabel")}:</label>
								<select
									id="target-format-select"
									value={targetFormat}
									onChange={(e) => setTargetFormat(e.target.value)}
								>
									{outputFormats.map((format) => (
										<option key={format.value} value={format.value}>
											{format.label}
										</option>
									))}
								</select>
							</div>
							{(targetFormat === "image/jpeg" || targetFormat === "image/webp") && (
								<div className="option-group">
									<label htmlFor="quality-input">{t("icQualityLabel")} (0.1 - 1.0):</label>
									<input
										type="number"
										id="quality-input"
										value={quality}
										min="0.1"
										max="1"
										step="0.01"
										onChange={(e) => setQuality(parseFloat(e.target.value))}
									/>
								</div>
							)}
						</div>

						<div className="ic-process-button-section">
							<button
								onClick={handleConvertAll}
								className="tool-btn"
								disabled={isProcessing || files.every((f) => f.status === "converted")}
							>
								<i className={`fas ${isProcessing ? "fa-spinner fa-spin" : "fa-cogs"}`}></i>
								{isProcessing ? t("icProcessing") : t("icConvertBtn")} (
								{files.filter((f) => f.status !== "converted" && f.status !== "error").length})
							</button>
						</div>
						{files.length > 5 && <p className="ic-warning-message">{t("icManyFilesWarning")}</p>}
					</>
				)}

				{files.length > 0 && (
					<div className="ic-preview-area">
						<h3>{t("icPreviewHeader")}</h3>
						<div className="image-previews-grid">
							{files.map((fileObj) => (
								<div key={fileObj.id} className="image-preview-item">
									<img src={fileObj.previewUrl} alt={fileObj.originalFile.name} />
									<p className="file-info">
										{fileObj.originalFile.name} ({formatBytes(fileObj.originalFile.size)})
									</p>
									<p className={`status ${fileObj.status.toLowerCase()}`}>
										{fileObj.status === "error" ? fileObj.error : t(`icStatus_${fileObj.status}`)}
									</p>
									{fileObj.status === "converted" && fileObj.convertedUrl && (
										<a
											href={fileObj.convertedUrl}
											download={fileObj.convertedFileName}
											className="download-link"
										>
											<i className="fas fa-download"></i> {t("icDownloadBtn")}
										</a>
									)}
								</div>
							))}
						</div>
					</div>
				)}
			</main>
		</div>
	);
};

export default ImageConverterPage;
