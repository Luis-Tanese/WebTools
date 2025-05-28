import React, { useState, useCallback } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { useToast } from "../hooks/useToast";
import "../css/url-shortener.css";

const SHORTENER_API_URL = "https://is.gd/create.php?format=json&url=";
// const SHORTENER_API_URL_VGD = "https://v.gd/create.php?format=json&url=";

const UrlShortenerPage = () => {
	const { t } = useTranslation();
	const { showToast } = useToast();
	const [longUrl, setLongUrl] = useState("");
	const [shortenedUrl, setShortenedUrl] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const isValidUrl = (string) => {
		try {
			new URL(string);
			return true;
		} catch (_) {
			return false;
		}
	};

	const handleShorten = useCallback(async () => {
		setShortenedUrl("");

		if (!longUrl.trim()) {
			showToast(t("usErrorInvalidUrl"), "error");
			return;
		}
		if (!isValidUrl(longUrl)) {
			showToast(t("usErrorInvalidUrl"), "error");
			return;
		}

		setIsLoading(true);
		try {
			const response = await fetch(`${SHORTENER_API_URL}${encodeURIComponent(longUrl)}`);
			const data = await response.json();

			if (data.shorturl) {
				setShortenedUrl(data.shorturl);
			} else if (data.errormessage) {
				showToast(`${t("usErrorShortening")}: ${data.errormessage}`, "error");
			} else {
				showToast(t("usErrorShortening"), "error");
			}
		} catch (err) {
			console.error("Shortening error:", err);
			showToast(t("usErrorShortening"), "error");
		} finally {
			setIsLoading(false);
		}
	}, [longUrl, t, showToast]);

	const handleCopy = () => {
		if (shortenedUrl) {
			navigator.clipboard
				.writeText(shortenedUrl)
				.then(() => {
					showToast(t("usCopiedSuccess"), "success");
				})
				.catch(() => showToast(t("usCopiedError"), "error"));
		}
	};

	return (
		<div className="container us-container">
			<header className="tool-header">
				<h1>{t("usPageTitle")}</h1>
				<p className="subtitle">{t("usPageSubtitle")}</p>
			</header>

			<main className="us-main">
				<div className="us-input-section">
					<label htmlFor="long-url-input">{t("usLongUrlLabel")}</label>
					<input
						type="url"
						id="long-url-input"
						value={longUrl}
						onChange={(e) => setLongUrl(e.target.value)}
						placeholder={t("usLongUrlPlaceholder")}
						disabled={isLoading}
					/>
					<button onClick={handleShorten} className="tool-btn us-shorten-btn" disabled={isLoading}>
						<i className={`fas ${isLoading ? "fa-spinner fa-spin" : "fa-link"}`}></i>
						{isLoading ? t("usShortening") : t("usShortenButton")}
					</button>
				</div>

				{shortenedUrl && (
					<div className="us-output-section">
						<label htmlFor="shortened-url-output">{t("usShortenedUrlLabel")}</label>
						<div className="us-output-display">
							<input type="text" id="shortened-url-output" value={shortenedUrl} readOnly />
							<button
								onClick={handleCopy}
								className="tool-btn-secondary us-copy-btn"
								title={t("usCopyButton")}
							>
								<i className="fas fa-copy"></i>
							</button>
						</div>
						<p className="us-visit-link">
							<a href={shortenedUrl} target="_blank" rel="noopener noreferrer">
								Visit: {shortenedUrl} <i className="fas fa-external-link-alt"></i>
							</a>
						</p>
					</div>
				)}
			</main>
		</div>
	);
};

export default UrlShortenerPage;
