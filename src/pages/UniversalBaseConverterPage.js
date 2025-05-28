import React, { useState, useCallback, useEffect } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { useToast } from "../hooks/useToast";
import { CONVERSION_TYPES, convertValue, handleTextSpecificConversions } from "../utils/baseConverterUtils";
import "../css/universal-base-converter.css";

const UniversalBaseConverterPage = () => {
	const { t } = useTranslation();
	const { showToast } = useToast();
	const [inputValue, setInputValue] = useState("");
	const [outputValue, setOutputValue] = useState("");
	const [fromType, setFromType] = useState("TEXT");
	const [toType, setToType] = useState("BINARY");

	const typeOptions = Object.values(CONVERSION_TYPES);

	const performConversion = useCallback(() => {
		if (!inputValue.trim()) {
			setOutputValue("");
			return;
		}

		try {
			let result = handleTextSpecificConversions(inputValue, fromType, toType);

			if (result === null) {
				result = convertValue(inputValue, fromType, toType);
			}
			setOutputValue(result);
		} catch (err) {
			console.error("Conversion error:", err);
			showToast(err.message || t("ubcErrorConversionFailed"), "error");
			setOutputValue("");
		}
	}, [inputValue, fromType, toType, t, showToast]);

	useEffect(() => {
		performConversion();
	}, [inputValue, fromType, toType, performConversion]);

	const handleInputChange = (e) => {
		setInputValue(e.target.value);
	};

	const handleSwapTypes = () => {
		setFromType(toType);
		setToType(fromType);
	};

	const handleCopyOutput = () => {
		if (outputValue) {
			navigator.clipboard
				.writeText(outputValue)
				.then(() => {
					showToast(t("ubcCopiedSuccess"), "success");
				})
				.catch(() => showToast(t("ubcCopiedError"), "error"));
		}
	};

	return (
		<div className="container ubc-container">
			<header className="tool-header">
				<h1>{t("ubcPageTitle")}</h1>
				<p className="subtitle">{t("ubcPageSubtitle")}</p>
			</header>

			<main className="ubc-main">
				<div className="ubc-controls-bar">
					<div className="ubc-type-selector">
						<label htmlFor="from-type-select">{t("ubcConvertFromLabel")}</label>
						<select id="from-type-select" value={fromType} onChange={(e) => setFromType(e.target.value)}>
							{typeOptions.map((opt) => (
								<option key={opt.key} value={opt.key}>
									{t(opt.labelKey)}
								</option>
							))}
						</select>
					</div>

					<button
						onClick={handleSwapTypes}
						className="tool-btn ubc-swap-button"
						title={t("ubcSwapButtonTitle")}
					>
						<i className="fas fa-exchange-alt"></i>
					</button>

					<div className="ubc-type-selector">
						<label htmlFor="to-type-select">{t("ubcConvertToLabel")}</label>
						<select id="to-type-select" value={toType} onChange={(e) => setToType(e.target.value)}>
							{typeOptions.map((opt) => (
								<option key={opt.key} value={opt.key}>
									{t(opt.labelKey)}
								</option>
							))}
						</select>
					</div>
				</div>

				<div className="ubc-io-area">
					<div className="ubc-pane">
						<label htmlFor="ubc-input">{t("ubcInputLabel")}</label>
						<textarea
							id="ubc-input"
							value={inputValue}
							onChange={handleInputChange}
							placeholder={t("ubcInputPlaceholder")}
							rows="8"
						/>
					</div>
					<div className="ubc-pane">
						<label htmlFor="ubc-output">{t("ubcOutputLabel")}</label>
						<textarea
							id="ubc-output"
							value={outputValue}
							readOnly
							placeholder={t("ubcOutputPlaceholder")}
							rows="8"
						/>
						{outputValue && (
							<button onClick={handleCopyOutput} className="tool-btn-secondary ubc-copy-btn">
								<i className="fas fa-copy"></i> {t("ubcCopyButtonText")}
							</button>
						)}
					</div>
				</div>
			</main>
		</div>
	);
};

export default UniversalBaseConverterPage;
