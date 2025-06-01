import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { useToast } from "../hooks/useToast";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import "../css/audio-converter.css";

const acceptedInputTypes = [
	"video/mp4",
	"video/x-matroska",
	"video/quicktime",
	"audio/mpeg",
	"audio/wav",
	"audio/ogg",
	"audio/aac",
	"audio/flac",
];

const outputFormats = [
	{ value: "mp3", label: "MP3", extension: "mp3" },
	{ value: "wav", label: "WAV", extension: "wav" },
	{ value: "ogg", label: "OGG (Doesn't work)", extension: "ogg" },
];

const bitrates = ["96", "128", "192", "256", "320"];

const formatBytes = (bytes, decimals = 2) => {
	if (!bytes || bytes === 0) return "0 Bytes";
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const AudioConverterPage = () => {
	const { t } = useTranslation();
	const { showToast } = useToast();
	const [files, setFiles] = useState([]);
	const [targetFormat, setTargetFormat] = useState("mp3");
	const [bitrate, setBitrate] = useState("192");
	const [isProcessingGlobal, setIsProcessingGlobal] = useState(false);
	const [isLoadingFfmpeg, setIsLoadingFfmpeg] = useState(true);
	const [ffmpegSuccessfullyLoaded, setFfmpegSuccessfullyLoaded] = useState(false);
	const ffmpegRef = useRef(null);
	const fileInputRef = useRef(null);
	const loadingToastShownRef = useRef(false);

	const updateFileStatus = useCallback((fileId, newStatus, data = {}) => {
		setFiles((prevFiles) => prevFiles.map((f) => (f.id === fileId ? { ...f, status: newStatus, ...data } : f)));
	}, []);

	const loadFfmpeg = useCallback(async () => {
		if (ffmpegSuccessfullyLoaded) {
			setIsLoadingFfmpeg(false);
			loadingToastShownRef.current = false;
			return;
		}

		if (!ffmpegRef.current) {
			const newFfmpeg = new FFmpeg();
			ffmpegRef.current = newFfmpeg;
		}

		if (!loadingToastShownRef.current && !ffmpegSuccessfullyLoaded) {
			showToast(t("acLoadingFfmpeg"), "info", 4000);
			loadingToastShownRef.current = true;
		}

		setIsLoadingFfmpeg(true);

		try {
			await ffmpegRef.current.load();
			setFfmpegSuccessfullyLoaded(true);
			if (loadingToastShownRef.current) {
				showToast("Converter engine loaded!", "success");
			}
			loadingToastShownRef.current = false;
		} catch (error) {
			console.error("FFmpeg load error:", error);
			let detailedError = t("acErrorFfmpegLoad");
			if (error.message && error.message.toLowerCase().includes("sharedarraybuffer")) {
				detailedError += ` (${
					t("errorSharedArrayBuffer") || "SharedArrayBuffer issue - check COOP/COEP headers"
				})`;
				console.error(
					"SharedArrayBuffer is not defined. Ensure COOP/COEP headers (Cross-Origin-Opener-Policy: same-origin, Cross-Origin-Embedder-Policy: require-corp) are correctly set on your development server AND deployment environment."
				);
			} else if (error.message) {
				detailedError += ` (${error.message})`;
			}
			showToast(detailedError, "error", 15000);
			ffmpegRef.current = null;
			setFfmpegSuccessfullyLoaded(false);
			loadingToastShownRef.current = false;
		} finally {
			setIsLoadingFfmpeg(false);
		}
	}, [t, showToast, ffmpegSuccessfullyLoaded]);

	useEffect(() => {
		if (!ffmpegSuccessfullyLoaded) {
			loadFfmpeg();
		}
	}, [loadFfmpeg, ffmpegSuccessfullyLoaded]);

	const handleFileChange = (event) => {
		const selectedFiles = Array.from(event.target.files);
		const newAudioFiles = selectedFiles
			.filter((file) => {
				const fileType = file.type;
				const fileName = file.name.toLowerCase();
				return (
					acceptedInputTypes.includes(fileType) ||
					fileName.endsWith(".mkv") ||
					fileName.endsWith(".mov") ||
					fileName.endsWith(".flac") ||
					fileName.endsWith(".aac")
				);
			})
			.map((file) => ({
				originalFile: file,
				id: `${file.name}-${file.lastModified}-${Math.random().toString(36).substring(2, 15)}`,
				status: !ffmpegSuccessfullyLoaded ? "loading_ffmpeg" : "pending",
				progress: 0,
				convertedUrl: null,
				convertedFileName: null,
				error: null,
			}));
		setFiles((prevFiles) => [...prevFiles, ...newAudioFiles]);
		if (event.target) event.target.value = null;
	};

	const triggerFileInput = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const convertAudio = useCallback(
		async (fileObject) => {
			if (!ffmpegSuccessfullyLoaded || !ffmpegRef.current) {
				showToast(t("acErrorFfmpegLoad"), "error");
				updateFileStatus(fileObject.id, "error", { error: t("acErrorFfmpegLoad") });
				return;
			}

			updateFileStatus(fileObject.id, "processing", { progress: 0 });
			const ffmpeg = ffmpegRef.current;
			const { originalFile } = fileObject;
			const uniqueInputId = fileObject.id.replace(/-/g, "_");
			const inputFileName = `input_${uniqueInputId}.${originalFile.name.split(".").pop()}`;
			const outputMeta = outputFormats.find((f) => f.value === targetFormat);
			const outputFileName = `output_${uniqueInputId}.${outputMeta.extension}`;

			let progressListener = null;

			try {
				try {
					await ffmpeg.unlink(inputFileName);
				} catch (e) {}
				try {
					await ffmpeg.unlink(outputFileName);
				} catch (e) {}

				await ffmpeg.writeFile(inputFileName, await fetchFile(originalFile));

				progressListener = ({ ratio }) => {
					if (ratio >= 0 && ratio <= 1) {
						updateFileStatus(fileObject.id, "processing", { progress: Math.round(ratio * 100) });
					} else if (ratio > 1) {
						updateFileStatus(fileObject.id, "processing", { progress: 100 });
					}
				};
				ffmpeg.on("progress", progressListener);

				const ffmpegArgs = ["-i", inputFileName];
				if ((targetFormat === "mp3" || targetFormat === "ogg") && bitrate) {
					ffmpegArgs.push("-b:a", `${bitrate}k`);
				}
				if (targetFormat === "ogg") {
					ffmpegArgs.push("-c:a", "libvorbis");
				}
				ffmpegArgs.push(outputFileName);

				await ffmpeg.exec(ffmpegArgs);

				const data = await ffmpeg.readFile(outputFileName);
				const blobType = targetFormat === "ogg" ? "audio/ogg" : `audio/${targetFormat}`;
				const blob = new Blob([data.buffer], { type: blobType });
				const url = URL.createObjectURL(blob);

				const originalNameBase =
					originalFile.name.substring(0, originalFile.name.lastIndexOf(".")) || originalFile.name;

				updateFileStatus(fileObject.id, "converted", {
					convertedUrl: url,
					convertedFileName: `${originalNameBase}_converted.${outputMeta.extension}`,
					progress: 100,
				});
			} catch (error) {
				console.error(`Conversion error for file: ${originalFile.name}`, error);
				updateFileStatus(fileObject.id, "error", { error: t("acErrorConversion") });
			} finally {
				if (progressListener && ffmpeg && typeof ffmpeg.off === "function") {
					ffmpeg.off("progress", progressListener);
				}
				try {
					if (ffmpeg && typeof ffmpeg.unlink === "function") await ffmpeg.unlink(inputFileName);
				} catch (e) {}
				try {
					if (ffmpeg && typeof ffmpeg.unlink === "function") await ffmpeg.unlink(outputFileName);
				} catch (e) {}
			}
		},
		[targetFormat, bitrate, t, showToast, updateFileStatus, ffmpegSuccessfullyLoaded]
	);

	const handleConvertAll = async () => {
		if (files.length === 0) {
			showToast(t("acErrorNoFiles"), "error");
			return;
		}
		if (!ffmpegSuccessfullyLoaded || !ffmpegRef.current) {
			showToast(t("acLoadingFfmpeg"), "info");
			await loadFfmpeg();
			if (!ffmpegSuccessfullyLoaded || !ffmpegRef.current) return;
		}

		setIsProcessingGlobal(true);
		for (const fileObject of files) {
			if (fileObject.status !== "converted" && fileObject.status !== "processing") {
				await convertAudio(fileObject);
			}
		}
		setIsProcessingGlobal(false);
	};

	useEffect(() => {
		return () => {
			files.forEach((file) => {
				if (file.convertedUrl && file.convertedUrl.startsWith("blob:")) {
					URL.revokeObjectURL(file.convertedUrl);
				}
			});
		};
	}, [files]);

	useEffect(() => {
		if (ffmpegSuccessfullyLoaded && files.some((f) => f.status === "loading_ffmpeg")) {
			setFiles((prevFiles) =>
				prevFiles.map((f) => (f.status === "loading_ffmpeg" ? { ...f, status: "pending" } : f))
			);
		}
	}, [ffmpegSuccessfullyLoaded, files]);

	return (
		<div className="container ac-container">
			<header className="tool-header">
				<h1>{t("acPageTitle")}</h1>
				<p className="subtitle">{t("acPageSubtitle")}</p>
			</header>

			<main className="ac-main">
				{isLoadingFfmpeg && !ffmpegSuccessfullyLoaded && (
					<div className="ac-loading-ffmpeg-indicator">
						<i className="fas fa-spinner fa-spin"></i> {t("acLoadingFfmpeg")}
					</div>
				)}
				<div
					className={`ac-upload-section ${isLoadingFfmpeg && !ffmpegSuccessfullyLoaded ? "disabled" : ""}`}
					onClick={!isLoadingFfmpeg || ffmpegSuccessfullyLoaded ? triggerFileInput : undefined}
					role="button"
					tabIndex={isLoadingFfmpeg && !ffmpegSuccessfullyLoaded ? -1 : 0}
					onKeyPress={(e) => {
						if ((!isLoadingFfmpeg || ffmpegSuccessfullyLoaded) && (e.key === "Enter" || e.key === " "))
							triggerFileInput();
					}}
					aria-disabled={isLoadingFfmpeg && !ffmpegSuccessfullyLoaded}
				>
					<i className="fas fa-cloud-upload-alt"></i>
					<p>{t("acUploadInstruction")}</p>
					<input
						type="file"
						id="audio-upload-input"
						ref={fileInputRef}
						multiple
						accept={acceptedInputTypes.join(",") + ",.mkv,.mov,.flac,.aac"}
						onChange={handleFileChange}
						style={{ display: "none" }}
						disabled={isLoadingFfmpeg && !ffmpegSuccessfullyLoaded}
					/>
				</div>

				{files.length > 0 && (
					<>
						<div className="ac-options-section">
							<div className="option-group">
								<label htmlFor="target-format-select">{t("acTargetFormatLabel")}:</label>
								<select
									id="target-format-select"
									value={targetFormat}
									onChange={(e) => setTargetFormat(e.target.value)}
									disabled={isProcessingGlobal || (isLoadingFfmpeg && !ffmpegSuccessfullyLoaded)}
								>
									{outputFormats.map((format) => (
										<option key={format.value} value={format.value}>
											{format.label}
										</option>
									))}
								</select>
							</div>
							{(targetFormat === "mp3" || targetFormat === "ogg") && (
								<div className="option-group">
									<label htmlFor="bitrate-select">{t("acBitrateLabel")}:</label>
									<select
										id="bitrate-select"
										value={bitrate}
										onChange={(e) => setBitrate(e.target.value)}
										disabled={isProcessingGlobal || (isLoadingFfmpeg && !ffmpegSuccessfullyLoaded)}
									>
										{bitrates.map((br) => (
											<option key={br} value={br}>
												{br} kbps
											</option>
										))}
									</select>
								</div>
							)}
						</div>

						<div className="ac-process-button-section">
							<button
								onClick={handleConvertAll}
								className="tool-btn"
								disabled={
									isProcessingGlobal ||
									(isLoadingFfmpeg && !ffmpegSuccessfullyLoaded) ||
									!ffmpegSuccessfullyLoaded ||
									files.every((f) => f.status === "converted")
								}
							>
								<i
									className={`fas ${
										isProcessingGlobal || (isLoadingFfmpeg && !ffmpegSuccessfullyLoaded)
											? "fa-spinner fa-spin"
											: "fa-cogs"
									}`}
								></i>
								{isProcessingGlobal
									? t("acProcessing")
									: isLoadingFfmpeg && !ffmpegSuccessfullyLoaded
									? t("acLoadingFfmpeg")
									: t("acConvertBtn")}{" "}
								({files.filter((f) => f.status === "pending" || f.status === "loading_ffmpeg").length})
							</button>
						</div>
						{files.length > 2 && <p className="ac-warning-message">{t("acManyFilesWarning")}</p>}
					</>
				)}

				{files.length > 0 && (
					<div className="ac-preview-area">
						<h3>{t("acPreviewHeader")}</h3>
						<div className="audio-previews-grid">
							{files.map((fileObj) => (
								<div key={fileObj.id} className="audio-preview-item">
									<i className="fas fa-file-audio preview-icon"></i>
									<p className="file-info">
										{fileObj.originalFile.name} ({formatBytes(fileObj.originalFile.size)})
									</p>
									<p className={`status ${fileObj.status.toLowerCase().replace(/\s+/g, "_")}`}>
										{fileObj.status === "error"
											? fileObj.error
											: fileObj.status === "processing"
											? `${t("acStatus_processing")} (${fileObj.progress || 0}%)`
											: t(`acStatus_${fileObj.status}`)}
									</p>
									{fileObj.status === "processing" && (fileObj.progress || 0) > 0 && (
										<div className="progress-bar-container">
											<div
												className="progress-bar"
												style={{ width: `${fileObj.progress || 0}%` }}
											></div>
										</div>
									)}
									{fileObj.status === "converted" && fileObj.convertedUrl && (
										<a
											href={fileObj.convertedUrl}
											download={fileObj.convertedFileName}
											className="download-link"
										>
											<i className="fas fa-download"></i> {t("acDownloadBtn")}
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
export default AudioConverterPage;
