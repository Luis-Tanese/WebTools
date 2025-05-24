import React, { useState, useEffect } from "react";
import { useTranslation } from "../hooks/useTranslation";
import "../css/browser-info.css";

const BrowserInfoPage = () => {
	const { t } = useTranslation();
	const [browserInfo, setBrowserInfo] = useState({});
	const [ipInfo, setIpInfo] = useState({ ip: t("biFetchingIP") || "Fetching..." });
	const [featureSupport, setFeatureSupport] = useState({});

	const getBrowserDetails = (userAgent) => {
		let browserName = "Unknown";
		let browserVersion = "Unknown";
		if (!userAgent) return { browserName, browserVersion };
		const ua = userAgent.toLowerCase();

		if (ua.includes("firefox/")) {
			browserName = "Firefox";
			browserVersion = ua.substring(ua.indexOf("firefox/") + 8).split(" ")[0];
		} else if (ua.includes("edg/")) {
			browserName = "Edge (Chromium)";
			browserVersion = ua.substring(ua.indexOf("edg/") + 4).split(" ")[0];
		} else if (ua.includes("edge/")) {
			browserName = "Edge (Legacy)";
			browserVersion = ua.substring(ua.indexOf("edge/") + 5).split(" ")[0];
		} else if (ua.includes("opr/") || ua.includes("opera")) {
			browserName = "Opera";
			browserVersion =
				ua.substring(ua.indexOf("version/") + 8) || ua.substring(ua.indexOf("opr/") + 4) || "Unknown";
			browserVersion = browserVersion.split(" ")[0];
		} else if (ua.includes("chrome/") && !ua.includes("chromium")) {
			browserName = "Chrome";
			browserVersion = ua.substring(ua.indexOf("chrome/") + 7).split(" ")[0];
		} else if (ua.includes("safari/") && !ua.includes("chrome") && !ua.includes("chromium")) {
			browserName = "Safari";
			browserVersion = ua.substring(ua.indexOf("version/") + 8) || ua.substring(ua.indexOf("safari/") + 7);
			browserVersion = browserVersion.split(" ")[0];
		} else if (ua.includes("msie ") || ua.includes("trident/")) {
			browserName = "Internet Explorer";
			browserVersion = ua.substring(ua.indexOf("msie ") + 5) || ua.substring(ua.indexOf("rv:") + 3);
			browserVersion = browserVersion.split(")")[0];
		}
		return { browserName, browserVersion };
	};

	useEffect(() => {
		const userAgent = navigator.userAgent;
		const { browserName, browserVersion } = getBrowserDetails(userAgent);

		setBrowserInfo({
			userAgent: userAgent,
			appName: navigator.appName,
			appCodeName: navigator.appCodeName,
			browserName: browserName,
			browserVersion: browserVersion,
			platform: navigator.platform,
			language: navigator.language || navigator.userLanguage,
			cookiesEnabled: navigator.cookieEnabled,
			onlineStatus: navigator.onLine,
			screenWidth: window.screen.width,
			screenHeight: window.screen.height,
			windowWidth: window.innerWidth,
			windowHeight: window.innerHeight,
			colorDepth: window.screen.colorDepth,
			doNotTrack: navigator.doNotTrack === "1" || navigator.doNotTrack === "yes" || window.doNotTrack === "1",
		});

		fetch("https://api.ipify.org?format=json")
			.then((response) => response.json())
			.then((data) => setIpInfo({ ip: data.ip }))
			.catch((error) => {
				console.error("Error fetching IP:", error);
				setIpInfo({ ip: t("biErrorFetchingIP") || "Could not fetch IP" });
			});

		setFeatureSupport({
			localStorage: typeof Storage !== "undefined" && !!window.localStorage,
			sessionStorage: typeof Storage !== "undefined" && !!window.sessionStorage,
			serviceWorkers: "serviceWorker" in navigator,
			webSockets: "WebSocket" in window,
			geolocation: "geolocation" in navigator,
			webRTC: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
			canvas: !!window.HTMLCanvasElement,
			webGL: (() => {
				try {
					const canvas = document.createElement("canvas");
					return !!(
						window.WebGLRenderingContext &&
						(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
					);
				} catch (e) {
					return false;
				}
			})(),
			webAssembly: typeof WebAssembly === "object" && typeof WebAssembly.instantiate === "function",
			fetch: "fetch" in window,
			promises: typeof Promise !== "undefined" && Promise.toString().includes("[native code]"),
			cssGrid: CSS.supports("display", "grid"),
			cssFlexbox: CSS.supports("display", "flex"),
			touchEvents: "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0,
			webpSupport: (() => {
				const elem = document.createElement("canvas");
				if (!!(elem.getContext && elem.getContext("2d"))) {
					return elem.toDataURL("image/webp").startsWith("data:image/webp");
				}
				return false;
			})(),
		});
	}, [t]);

	const renderSupport = (isSupported) => {
		if (isSupported === true) return <span className="info-value supported">{t("biSupported")}</span>;
		if (isSupported === false) return <span className="info-value not-supported">{t("biNotSupported")}</span>;
		return <span className="info-value unknown">{t("biUnknown")}</span>;
	};

	return (
		<div className="container bi-container">
			<header className="tool-header">
				<h1>{t("biPageTitle")}</h1>
				<p className="subtitle">{t("biPageSubtitle")}</p>
			</header>

			<main className="bi-main">
				<div className="privacy-note">
					<p>
						<strong>{t("biPrivacyNoteTitle")}:</strong> {t("biPrivacyNoteText1")}
					</p>
					<p>{t("biPrivacyNoteText2")}</p>
				</div>

				<section className="info-section">
					<h2>
						<i className="fas fa-desktop"></i> {t("biBrowserInfoHeader")}
					</h2>
					<div className="info-grid">
						<div className="info-item">
							<span className="info-label">{t("biUserAgent")}:</span>{" "}
							<span className="info-value">{browserInfo.userAgent}</span>
						</div>
						<div className="info-item">
							<span className="info-label">{t("biBrowserName")}:</span>{" "}
							<span className="info-value">{browserInfo.browserName}</span>
						</div>
						<div className="info-item">
							<span className="info-label">{t("biBrowserVersion")}:</span>{" "}
							<span className="info-value">{browserInfo.browserVersion}</span>
						</div>
						<div className="info-item">
							<span className="info-label">{t("biOS")}:</span>{" "}
							<span className="info-value">{browserInfo.platform}</span>
						</div>
						<div className="info-item">
							<span className="info-label">{t("biLanguage")}:</span>{" "}
							<span className="info-value">{browserInfo.language}</span>
						</div>
						<div className="info-item">
							<span className="info-label">{t("biCookiesEnabled")}:</span>{" "}
							{renderSupport(browserInfo.cookiesEnabled)}
						</div>
						<div className="info-item">
							<span className="info-label">{t("biOnlineStatus")}:</span>{" "}
							{browserInfo.onlineStatus ? (
								<span className="info-value supported">{t("biOnline")}</span>
							) : (
								<span className="info-value not-supported">{t("biOffline")}</span>
							)}
						</div>
						<div className="info-item">
							<span className="info-label">{t("biScreenResolution")}:</span>{" "}
							<span className="info-value">
								{browserInfo.screenWidth} x {browserInfo.screenHeight}
							</span>
						</div>
						<div className="info-item">
							<span className="info-label">{t("biWindowResolution")}:</span>{" "}
							<span className="info-value">
								{browserInfo.windowWidth} x {browserInfo.windowHeight}
							</span>
						</div>
						<div className="info-item">
							<span className="info-label">{t("biColorDepth")}:</span>{" "}
							<span className="info-value">{browserInfo.colorDepth}-bit</span>
						</div>
						<div className="info-item">
							<span className="info-label">{t("biDoNotTrack")}:</span>{" "}
							{renderSupport(browserInfo.doNotTrack)}
						</div>
					</div>
				</section>

				<section className="info-section">
					<h2>
						<i className="fas fa-network-wired"></i> {t("biIPInfoHeader")}
					</h2>
					<div className="info-grid">
						<div className="info-item">
							<span className="info-label">{t("biYourIP")}:</span>{" "}
							<span className="info-value">{ipInfo.ip}</span>
						</div>
					</div>
				</section>

				<section className="info-section">
					<h2>
						<i className="fas fa-cogs"></i> {t("biFeatureDetectionHeader")}
					</h2>
					<div className="info-grid">
						<div className="info-item">
							<span className="info-label">LocalStorage:</span>{" "}
							{renderSupport(featureSupport.localStorage)}
						</div>
						<div className="info-item">
							<span className="info-label">SessionStorage:</span>{" "}
							{renderSupport(featureSupport.sessionStorage)}
						</div>
						<div className="info-item">
							<span className="info-label">Service Workers:</span>{" "}
							{renderSupport(featureSupport.serviceWorkers)}
						</div>
						<div className="info-item">
							<span className="info-label">WebSockets:</span> {renderSupport(featureSupport.webSockets)}
						</div>
						<div className="info-item">
							<span className="info-label">Geolocation:</span> {renderSupport(featureSupport.geolocation)}
						</div>
						<div className="info-item">
							<span className="info-label">WebRTC (getUserMedia):</span>{" "}
							{renderSupport(featureSupport.webRTC)}
						</div>
						<div className="info-item">
							<span className="info-label">Canvas API:</span> {renderSupport(featureSupport.canvas)}
						</div>
						<div className="info-item">
							<span className="info-label">WebGL:</span> {renderSupport(featureSupport.webGL)}
						</div>
						<div className="info-item">
							<span className="info-label">WebAssembly:</span> {renderSupport(featureSupport.webAssembly)}
						</div>
						<div className="info-item">
							<span className="info-label">Fetch API:</span> {renderSupport(featureSupport.fetch)}
						</div>
						<div className="info-item">
							<span className="info-label">Promises (ES6):</span> {renderSupport(featureSupport.promises)}
						</div>
						<div className="info-item">
							<span className="info-label">CSS Grid:</span> {renderSupport(featureSupport.cssGrid)}
						</div>
						<div className="info-item">
							<span className="info-label">CSS Flexbox:</span> {renderSupport(featureSupport.cssFlexbox)}
						</div>
						<div className="info-item">
							<span className="info-label">Touch Events:</span>{" "}
							{renderSupport(featureSupport.touchEvents)}
						</div>
						<div className="info-item">
							<span className="info-label">WebP Support:</span>{" "}
							{renderSupport(featureSupport.webpSupport)}
						</div>
					</div>
				</section>
			</main>
		</div>
	);
};

export default BrowserInfoPage;
