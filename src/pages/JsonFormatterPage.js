import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "../hooks/useTranslation";
import "../css/json-formatter.css";

const JsonFormatterPage = () => {
	const { t } = useTranslation();
	const [inputText, setInputText] = useState("");
	const [outputText, setOutputText] = useState("");
	const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

	const clearStatus = () => setStatusMessage({ type: "", text: "" });

	const handleInputChange = (event) => {
		setInputText(event.target.value);
		clearStatus();
	};

	const validateJson = useCallback(
		(jsonString) => {
			if (!jsonString.trim()) {
				setStatusMessage({ type: "error", text: t("jfErrorEmptyInput") });
				return null;
			}
			try {
				const parsed = JSON.parse(jsonString);
				setStatusMessage({ type: "success", text: t("jfValidationSuccess") });
				return parsed;
			} catch (error) {
				setStatusMessage({ type: "error", text: `${t("jfValidationError")}: ${error.message}` });
				return null;
			}
		},
		[t]
	);

	const handleFormat = () => {
		clearStatus();
		const parsedJson = validateJson(inputText);
		if (parsedJson) {
			try {
				setOutputText(JSON.stringify(parsedJson, null, 2));
			} catch (error) {
				setStatusMessage({ type: "error", text: t("jfErrorFormatting") });
			}
		} else {
			setOutputText("");
		}
	};

	const handleMinify = () => {
		clearStatus();
		const parsedJson = validateJson(inputText);
		if (parsedJson) {
			try {
				setOutputText(JSON.stringify(parsedJson));
			} catch (error) {
				setStatusMessage({ type: "error", text: t("jfErrorMinifying") });
			}
		} else {
			setOutputText("");
		}
	};

	const handleClearInput = () => {
		setInputText("");
		setOutputText("");
		clearStatus();
	};

	const handleCopyOutput = () => {
		if (outputText) {
			navigator.clipboard
				.writeText(outputText)
				.then(() => {
					setStatusMessage({ type: "success", text: t("jfCopiedSuccess") });
					setTimeout(clearStatus, 2000);
				})
				.catch((err) => {
					setStatusMessage({ type: "error", text: t("jfErrorCopying") });
					console.error("Copy failed: ", err);
				});
		}
	};

	useEffect(() => {
		if (inputText.trim() === "") {
			setOutputText("");
			clearStatus();
		}
	}, [inputText]);

	return (
		<div className="container jf-container">
			<header className="tool-header">
				<h1>{t("jfPageTitle")}</h1>
				<p className="subtitle">{t("jfPageSubtitle")}</p>
			</header>

			<main className="jf-main">
				<div className="jf-io-area">
					<div className="jf-pane input-pane">
						<div className="jf-pane-header">
							<h3>{t("jfInputHeader")}</h3>
							<div className="jf-pane-actions">
								<button onClick={handleClearInput} title={t("jfClearInputTitle")}>
									<i className="fas fa-times-circle"></i>
								</button>
							</div>
						</div>
						<textarea
							id="json-input"
							value={inputText}
							onChange={handleInputChange}
							placeholder={t("jfInputPlaceholder")}
							spellCheck="false"
						/>
					</div>
					<div className="jf-pane output-pane">
						<div className="jf-pane-header">
							<h3>{t("jfOutputHeader")}</h3>
							<div className="jf-pane-actions">
								<button
									onClick={handleCopyOutput}
									title={t("jfCopyOutputTitle")}
									disabled={!outputText}
								>
									<i className="fas fa-copy"></i>
								</button>
							</div>
						</div>
						<textarea
							id="json-output"
							value={outputText}
							readOnly
							placeholder={t("jfOutputPlaceholder")}
							spellCheck="false"
						/>
					</div>
				</div>

				{statusMessage.text && (
					<div className={`jf-status-message ${statusMessage.type}`}>{statusMessage.text}</div>
				)}

				<div className="jf-controls">
					<button onClick={handleFormat} className="tool-btn">
						<i className="fas fa-align-left"></i> {t("jfBeautifyBtn")}
					</button>
					<button onClick={handleMinify} className="tool-btn">
						<i className="fas fa-compress-arrows-alt"></i> {t("jfMinifyBtn")}
					</button>
				</div>
			</main>
		</div>
	);
};

export default JsonFormatterPage;
