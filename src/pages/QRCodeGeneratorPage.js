import React, { useState, useEffect, useRef, useCallback } from "react";
import QRCode from "qrcode";
import { useTranslation } from "../hooks/useTranslation";
import { useToast } from "../hooks/useToast";
import "../css/qr-generator.css";

const QRCodeGeneratorPage = () => {
	const { t, language } = useTranslation();
	const { showToast } = useToast();
	const [text, setText] = useState("");
	const [qrDataURL, setQrDataURL] = useState(null);
	const [buttonsDisabled, setButtonsDisabled] = useState(true);
	const canvasRef = useRef(null);
	const qrPlaceholderTextRef = useRef(null);

	const generateQRCode = useCallback(() => {
		if (!text.trim()) {
			if (canvasRef.current) {
				const ctx = canvasRef.current.getContext("2d");
				ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
			}
			if (qrPlaceholderTextRef.current) {
				qrPlaceholderTextRef.current.style.display = "block";
				qrPlaceholderTextRef.current.textContent = t("qrCanvasPlaceholder");
			}
			if (canvasRef.current) canvasRef.current.style.display = "none";
			setQrDataURL(null);
			setButtonsDisabled(true);
			return;
		}

		if (qrPlaceholderTextRef.current) qrPlaceholderTextRef.current.style.display = "none";
		if (canvasRef.current) canvasRef.current.style.display = "block";

		QRCode.toCanvas(
			canvasRef.current,
			text,
			{
				width: 256,
				margin: 1,
				errorCorrectionLevel: "H",
			},
			(error) => {
				if (error) {
					console.error("QR Code generation error:", error);
					if (qrPlaceholderTextRef.current) {
						qrPlaceholderTextRef.current.textContent = t("qrError");
						qrPlaceholderTextRef.current.style.display = "block";
					}
					if (canvasRef.current) canvasRef.current.style.display = "none";
					setQrDataURL(null);
					setButtonsDisabled(true);
					showToast(t("qrError"), "error");
				} else {
					setQrDataURL(canvasRef.current.toDataURL("image/png"));
					setButtonsDisabled(false);
				}
			}
		);
	}, [text, t, showToast]);

	useEffect(() => {
		generateQRCode();
	}, [generateQRCode]);

	useEffect(() => {
		if (!text.trim() && qrPlaceholderTextRef.current) {
			qrPlaceholderTextRef.current.textContent = t("qrCanvasPlaceholder");
		}
	}, [language, t, text]);

	const handleCopy = () => {
		if (!canvasRef.current || !qrDataURL) return;
		canvasRef.current.toBlob((blob) => {
			if (navigator.clipboard && navigator.clipboard.write) {
				navigator.clipboard
					.write([new ClipboardItem({ "image/png": blob })])
					.then(() => showToast(t("qrCopiedSuccess"), "success"))
					.catch(() => showToast(t("qrCopiedError"), "error"));
			} else {
				showToast(t("qrCopyFallback"), "warning", 8000);
			}
		}, "image/png");
	};

	const handleDownload = () => {
		if (!qrDataURL) return;
		const link = document.createElement("a");
		link.download = "qrcode.png";
		link.href = qrDataURL;
		link.click();
	};

	return (
		<div className="container qr-container">
			<header className="tool-header">
				<h1>{t("qrPageTitle")}</h1>
				<p className="subtitle">{t("qrPageSubtitle")}</p>
			</header>
			<main className="qr-main">
				<div className="input-section">
					<label htmlFor="qr-text">{t("qrInputLabel")}</label>
					<textarea
						id="qr-text"
						rows="4"
						placeholder={t("qrInputPlaceholder")}
						value={text}
						onChange={(e) => setText(e.target.value)}
					/>
				</div>

				<div className="qr-code-display">
					<canvas ref={canvasRef} id="qr-canvas" style={{ display: "none" }}></canvas>
					<p ref={qrPlaceholderTextRef} id="qr-placeholder-text">
						{t("qrCanvasPlaceholder")}
					</p>
				</div>

				<div className="action-buttons">
					<button onClick={handleCopy} className="tool-btn" disabled={buttonsDisabled}>
						<i className="fas fa-copy"></i> {t("qrCopyButtonText")}
					</button>
					<button onClick={handleDownload} className="tool-btn" disabled={buttonsDisabled}>
						<i className="fas fa-download"></i> {t("qrDownloadButtonText")}
					</button>
				</div>
			</main>
		</div>
	);
};

export default QRCodeGeneratorPage;
