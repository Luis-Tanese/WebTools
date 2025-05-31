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
	const qrDisplayRef = useRef(null);

	const generateQRCode = useCallback(() => {
		if (!text.trim()) {
			if (canvasRef.current) {
				const ctx = canvasRef.current.getContext("2d");
				ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
				canvasRef.current.style.display = "none";
			}
			if (qrPlaceholderTextRef.current) {
				qrPlaceholderTextRef.current.style.display = "block";
				qrPlaceholderTextRef.current.textContent = t("qrCanvasPlaceholder");
			}
			setQrDataURL(null);
			setButtonsDisabled(true);
			return;
		}

		if (qrPlaceholderTextRef.current) qrPlaceholderTextRef.current.style.display = "none";
		if (canvasRef.current) canvasRef.current.style.display = "block";

		let canvasSize = 256;
		if (qrDisplayRef.current) {
			const computedStyle = getComputedStyle(qrDisplayRef.current);
			const newSize = parseInt(computedStyle.width, 10);
			if (!isNaN(newSize) && newSize > 0) {
				canvasSize = newSize;
			}
		}

		if (!canvasRef.current) {
			console.error("Canvas ref not available for QR Code generation.");
			showToast(t("qrError"), "error");
			setButtonsDisabled(true);
			return;
		}

		QRCode.toCanvas(
			canvasRef.current,
			text,
			{
				width: canvasSize,
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
					if (canvasRef.current) {
						setQrDataURL(canvasRef.current.toDataURL("image/png"));
					}
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

	useEffect(() => {
		const handleResize = () => {
			if (
				text.trim() &&
				canvasRef.current &&
				canvasRef.current.style.display !== "none" &&
				qrDisplayRef.current
			) {
				generateQRCode();
			}
		};

		let resizeTimer;
		const debouncedHandleResize = () => {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(handleResize, 250);
		};

		window.addEventListener("resize", debouncedHandleResize);
		return () => {
			clearTimeout(resizeTimer);
			window.removeEventListener("resize", debouncedHandleResize);
		};
	}, [text, generateQRCode]);

	const handleCopy = () => {
		if (!canvasRef.current || !qrDataURL) return;
		canvasRef.current.toBlob((blob) => {
			if (blob && navigator.clipboard && navigator.clipboard.write) {
				navigator.clipboard
					.write([new ClipboardItem({ "image/png": blob })])
					.then(() => showToast(t("qrCopiedSuccess"), "success"))
					.catch((err) => {
						console.error("Copy to clipboard error:", err);
						showToast(t("qrCopiedError"), "error");
					});
			} else if (blob) {
				showToast(t("qrCopyFallback"), "warning", 8000);
			} else {
				showToast(t("qrCopiedError"), "error");
			}
		}, "image/png");
	};

	const handleDownload = () => {
		if (!qrDataURL) return;
		const link = document.createElement("a");
		link.download = "qrcode.png";
		link.href = qrDataURL;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
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

				<div className="qr-code-display" ref={qrDisplayRef}>
					<canvas ref={canvasRef} id="qr-canvas" style={{ display: "none" }}></canvas>
					<p ref={qrPlaceholderTextRef} id="qr-placeholder-text" style={{ display: "block" }}>
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
