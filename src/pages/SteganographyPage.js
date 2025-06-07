import React, { useState, useRef } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { useToast } from "../hooks/useToast";
import { encodeMessageInImage, decodeMessageFromImage } from "../utils/steganographyUtils";
import "../css/steganography.css";

const SteganographyPage = () => {
	const { t } = useTranslation();
	const { showToast } = useToast();
	const [mode, setMode] = useState("encode");
	const [secretText, setSecretText] = useState("");
	const [imageFile, setImageFile] = useState(null);
	const [imagePreview, setImagePreview] = useState(null);
	const [encodedImageURL, setEncodedImageURL] = useState(null);
	const [outputFilename, setOutputFilename] = useState("encoded-image.png");
	const [decodedText, setDecodedText] = useState(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const canvasRef = useRef(document.createElement("canvas"));
	const fileInputRef = useRef(null);

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file && file.type.startsWith("image/")) {
			setImageFile(file);
			const originalFilename = file.name.substring(0, file.name.lastIndexOf("."));
			setOutputFilename(`${originalFilename}-encoded.png`);

			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result);
			};
			reader.readAsDataURL(file);
			setEncodedImageURL(null);
			setDecodedText(null);
		} else {
			showToast(t("stegErrorInvalidFileType"), "error");
		}
	};

	const processImage = (processFunc) => {
		if (!imageFile) {
			showToast(t("stegErrorNoImage"), "error");
			return;
		}
		setIsProcessing(true);

		const reader = new FileReader();
		reader.onload = (event) => {
			const img = new Image();
			img.onload = () => {
				const canvas = canvasRef.current;
				const ctx = canvas.getContext("2d");
				canvas.width = img.width;
				canvas.height = img.height;
				ctx.drawImage(img, 0, 0);

				try {
					processFunc(ctx, img.width, img.height);
				} catch (error) {
					showToast(error.message || t("stegErrorProcessing"), "error");
				} finally {
					setIsProcessing(false);
				}
			};
			img.src = event.target.result;
		};
		reader.readAsDataURL(imageFile);
	};

	const handleEncode = () => {
		if (!secretText.trim()) {
			showToast(t("stegErrorNoText"), "error");
			return;
		}
		processImage((ctx, width, height) => {
			encodeMessageInImage(ctx, width, height, secretText);
			canvasRef.current.toBlob((blob) => {
				setEncodedImageURL(URL.createObjectURL(blob));
				showToast(t("stegSuccessEncode"), "success");
			}, "image/png");
		});
	};

	const handleDecode = () => {
		processImage((ctx, width, height) => {
			const message = decodeMessageFromImage(ctx, width, height);
			setDecodedText(message);
			if (message) {
				showToast(t("stegSuccessDecode"), "success");
			} else {
				showToast(t("stegErrorNoMessageFound"), "warning");
			}
		});
	};

	const resetState = () => {
		setImageFile(null);
		setImagePreview(null);
		setSecretText("");
		setEncodedImageURL(null);
		setOutputFilename("encoded-image.png");
		setDecodedText(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleDownload = (e) => {
		e.preventDefault();
		const finalFilename = outputFilename.trim() || "encoded-image.png";
		const a = document.createElement("a");
		a.href = encodedImageURL;
		a.download = finalFilename.endsWith(".png") ? finalFilename : `${finalFilename}.png`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	};

	return (
		<div className="container steg-container">
			<header className="tool-header">
				<h1>{t("stegPageTitle")}</h1>
				<p className="subtitle">{t("stegPageSubtitle")}</p>
			</header>

			<main className="steg-main">
				<div className="operation-toggle">
					<button
						onClick={() => {
							setMode("encode");
							resetState();
						}}
						className={`toggle-btn ${mode === "encode" ? "active" : ""}`}
					>
						{t("stegEncodeMode")}
					</button>
					<button
						onClick={() => {
							setMode("decode");
							resetState();
						}}
						className={`toggle-btn ${mode === "decode" ? "active" : ""}`}
					>
						{t("stegDecodeMode")}
					</button>
				</div>

				<div className="steg-content">
					<div className="steg-input-section">
						<h3>{t(mode === "encode" ? "stegInputHeaderEncode" : "stegInputHeaderDecode")}</h3>
						<div className="file-input-wrapper">
							<label htmlFor="steg-image-upload" className="file-upload-label">
								<i className="fas fa-upload"></i> {t("stegSelectImage")}
							</label>
							<input
								id="steg-image-upload"
								type="file"
								accept="image/png, image/jpeg"
								ref={fileInputRef}
								onChange={handleImageChange}
								style={{ display: "none" }}
							/>
						</div>
						{imagePreview && (
							<div className="image-preview-container">
								<img src={imagePreview} alt="Preview" className="image-preview" />
							</div>
						)}
						{mode === "encode" && (
							<div className="secret-text-input">
								<label htmlFor="secret-text">{t("stegSecretTextLabel")}</label>
								<textarea
									id="secret-text"
									rows="6"
									placeholder={t("stegSecretTextPlaceholder")}
									value={secretText}
									onChange={(e) => setSecretText(e.target.value)}
								/>
							</div>
						)}
					</div>

					<div className="steg-action-section">
						<button
							onClick={mode === "encode" ? handleEncode : handleDecode}
							className="tool-btn"
							disabled={isProcessing || !imageFile}
						>
							<i
								className={`fas ${
									isProcessing
										? "fa-spinner fa-spin"
										: mode === "encode"
										? "fa-user-secret"
										: "fa-search"
								}`}
							></i>
							{isProcessing
								? t("stegProcessing")
								: t(mode === "encode" ? "stegEncodeAction" : "stegDecodeAction")}
						</button>
					</div>

					<div className="steg-output-section">
						<h3>{t("stegOutputHeader")}</h3>
						{mode === "encode" && encodedImageURL && (
							<div className="output-content">
								<p>{t("stegEncodeSuccessMessage")}</p>
								<img src={encodedImageURL} alt="Encoded" className="image-preview" />
								<div className="filename-input-group">
									<label htmlFor="output-filename">{t("stegOutputFilenameLabel")}</label>
									<input
										type="text"
										id="output-filename"
										value={outputFilename}
										onChange={(e) => setOutputFilename(e.target.value)}
										placeholder="encoded-image.png"
									/>
								</div>
								<a href={encodedImageURL} onClick={handleDownload} className="tool-btn">
									<i className="fas fa-download"></i> {t("stegDownloadButton")}
								</a>
							</div>
						)}
						{mode === "decode" && decodedText !== null && (
							<div className="output-content">
								<p>{decodedText ? t("stegDecodeSuccessMessage") : t("stegDecodeFailMessage")}</p>
								<textarea
									className="decoded-text-output"
									readOnly
									value={decodedText || ""}
									placeholder={t("stegDecodedTextPlaceholder")}
								></textarea>
							</div>
						)}
					</div>
				</div>
			</main>
		</div>
	);
};

export default SteganographyPage;
