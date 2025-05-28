import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { useToast } from "../hooks/useToast";
import "../css/json-formatter.css";

const JsonFormatterPage = () => {
	const { t } = useTranslation();
	const { showToast } = useToast();
	const [inputText, setInputText] = useState("");
	const [outputText, setOutputText] = useState("");

	const handleInputChange = (event) => {
		setInputText(event.target.value);
	};

	const validateJson = useCallback(
		(jsonString) => {
			if (!jsonString.trim()) {
				showToast(t("jfErrorEmptyInput"), "error");
				return null;
			}
			try {
				const parsed = JSON.parse(jsonString);
				showToast(t("jfValidationSuccess"), "success");
				return parsed;
			} catch (error) {
				showToast(`${t("jfValidationError")}: ${error.message}`, "error");
				return null;
			}
		},
		[t, showToast]
	);

	const handleFormat = () => {
		const parsedJson = validateJson(inputText);
		if (parsedJson) {
			try {
				setOutputText(JSON.stringify(parsedJson, null, 2));
			} catch (error) {
				showToast(t("jfErrorFormatting"), "error");
				setOutputText("");
			}
		} else {
			setOutputText("");
		}
	};

	const handleMinify = () => {
		const parsedJson = validateJson(inputText);
		if (parsedJson) {
			try {
				setOutputText(JSON.stringify(parsedJson));
			} catch (error) {
				showToast(t("jfErrorMinifying"), "error");
				setOutputText("");
			}
		} else {
			setOutputText("");
		}
	};

	const handleClearInput = () => {
		setInputText("");
		setOutputText("");
	};

	const handleCopyOutput = () => {
		if (outputText) {
			navigator.clipboard
				.writeText(outputText)
				.then(() => {
					showToast(t("jfCopiedSuccess"), "success");
				})
				.catch((err) => {
					showToast(t("jfErrorCopying"), "error");
					console.error("Copy failed: ", err);
				});
		}
	};

	useEffect(() => {
		if (inputText.trim() === "") {
			setOutputText("");
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
