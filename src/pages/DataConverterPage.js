import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { useToast } from "../hooks/useToast";
import Papa from "papaparse";
import yaml from "js-yaml";
import "../css/data-converter.css";

const formatOptions = [
	{ value: "json", labelKey: "dcFormatJson" },
	{ value: "csv", labelKey: "dcFormatCsv" },
	{ value: "yaml", labelKey: "dcFormatYaml" },
];

const DataConverterPage = () => {
	const { t } = useTranslation();
	const { showToast } = useToast();
	const [inputText, setInputText] = useState("");
	const [outputText, setOutputText] = useState("");
	const [inputFormat, setInputFormat] = useState("json");
	const [outputFormat, setOutputFormat] = useState("csv");
	const [beautifyJson, setBeautifyJson] = useState(true);
	const [csvHeader, setCsvHeader] = useState(true);

	const handleInputChange = (e) => {
		setInputText(e.target.value);
	};

	const handleClearInput = () => {
		setInputText("");
		setOutputText("");
	};

	const handleCopyOutput = () => {
		if (outputText) {
			navigator.clipboard
				.writeText(outputText)
				.then(() => showToast(t("dcCopiedSuccess"), "success"))
				.catch(() => showToast(t("dcErrorCopying"), "error"));
		}
	};

	const handleSwapFormats = () => {
		const currentInput = inputText;
		const currentOutput = outputText;
		const currentInFormat = inputFormat;
		const currentOutFormat = outputFormat;

		setInputFormat(currentOutFormat);
		setOutputFormat(currentInFormat);
		setInputText(currentOutput);
		setOutputText(currentInput);
	};

	const convertData = useCallback(() => {
		if (!inputText.trim()) {
			showToast(t("dcErrorEmptyInput"), "error");
			setOutputText("");
			return;
		}

		let intermediateJson;

		try {
			switch (inputFormat) {
				case "json":
					intermediateJson = JSON.parse(inputText);
					break;
				case "csv":
					const parseResult = Papa.parse(inputText.trim(), {
						header: csvHeader,
						skipEmptyLines: true,
						dynamicTyping: true,
					});
					if (parseResult.errors.length > 0) {
						throw new Error(`${t("dcErrorCsvParse")}: ${parseResult.errors[0].message}`);
					}
					intermediateJson = parseResult.data;
					break;
				case "yaml":
					intermediateJson = yaml.load(inputText);
					if (typeof intermediateJson === "string" && outputFormat !== "yaml") {
						try {
							intermediateJson = JSON.parse(intermediateJson);
						} catch (e) {}
					}
					break;
				default:
					throw new Error(t("dcErrorInvalidInputFormat"));
			}
		} catch (error) {
			showToast(t("dcErrorParsingInput") + (error.message ? `: ${error.message}` : ""), "error");
			setOutputText("");
			return;
		}

		if (intermediateJson === undefined || intermediateJson === null) {
			showToast(t("dcErrorParsingInput") + ": " + t("dcErrorNoDataAfterParse"), "error");
			setOutputText("");
			return;
		}

		try {
			let resultText = "";
			switch (outputFormat) {
				case "json":
					resultText = JSON.stringify(intermediateJson, null, beautifyJson ? 2 : undefined);
					break;
				case "csv":
					if (!Array.isArray(intermediateJson)) {
						intermediateJson = [intermediateJson];
					}
					resultText = Papa.unparse(intermediateJson, { header: csvHeader });
					break;
				case "yaml":
					resultText = yaml.dump(intermediateJson, { indent: 2 });
					break;
				default:
					throw new Error(t("dcErrorInvalidOutputFormat"));
			}
			setOutputText(resultText);
			showToast(t("dcConversionSuccess"), "success");
		} catch (error) {
			showToast(t("dcErrorFormattingOutput") + (error.message ? `: ${error.message}` : ""), "error");
			setOutputText("");
		}
	}, [inputText, inputFormat, outputFormat, beautifyJson, csvHeader, t, showToast]);

	useEffect(() => {
		if (!inputText.trim()) {
			setOutputText("");
		}
	}, [inputFormat, outputFormat, inputText]);

	return (
		<div className="container dc-container">
			<header className="tool-header">
				<h1>{t("dcPageTitle")}</h1>
				<p className="subtitle">{t("dcPageSubtitle")}</p>
			</header>

			<main className="dc-main">
				<div className="dc-controls-bar">
					<div className="dc-format-selector">
						<label htmlFor="input-format-select">{t("dcConvertFrom")}:</label>
						<select
							id="input-format-select"
							value={inputFormat}
							onChange={(e) => setInputFormat(e.target.value)}
						>
							{formatOptions.map((opt) => (
								<option key={`in-${opt.value}`} value={opt.value}>
									{t(opt.labelKey)}
								</option>
							))}
						</select>
					</div>

					<button
						onClick={handleSwapFormats}
						className="tool-btn dc-swap-button"
						title={t("dcSwapFormatsTitle")}
					>
						<i className="fas fa-exchange-alt"></i>
					</button>

					<div className="dc-format-selector">
						<label htmlFor="output-format-select">{t("dcConvertTo")}:</label>
						<select
							id="output-format-select"
							value={outputFormat}
							onChange={(e) => setOutputFormat(e.target.value)}
						>
							{formatOptions.map((opt) => (
								<option key={`out-${opt.value}`} value={opt.value}>
									{t(opt.labelKey)}
								</option>
							))}
						</select>
					</div>
					<div className="dc-options">
						{outputFormat === "json" && (
							<div className="option-item">
								<input
									type="checkbox"
									id="beautify-json-check"
									checked={beautifyJson}
									onChange={(e) => setBeautifyJson(e.target.checked)}
								/>
								<label htmlFor="beautify-json-check">{t("dcBeautifyJson")}</label>
							</div>
						)}
						{(inputFormat === "csv" || outputFormat === "csv") && (
							<div className="option-item">
								<input
									type="checkbox"
									id="csv-header-check"
									checked={csvHeader}
									onChange={(e) => setCsvHeader(e.target.checked)}
								/>
								<label htmlFor="csv-header-check">{t("dcCsvHeader")}</label>
							</div>
						)}
					</div>
				</div>

				<div className="dc-io-area">
					<div className="dc-pane input-pane">
						<div className="dc-pane-header">
							<h3>{t("dcInputHeader")}</h3>
							<div className="dc-pane-actions">
								<button onClick={handleClearInput} title={t("dcClearInputTitle")}>
									<i className="fas fa-times-circle"></i>
								</button>
							</div>
						</div>
						<textarea
							className="dc-textarea"
							value={inputText}
							onChange={handleInputChange}
							placeholder={t("dcInputPlaceholder", { format: inputFormat.toUpperCase() })}
							spellCheck="false"
						/>
					</div>
					<div className="dc-pane output-pane">
						<div className="dc-pane-header">
							<h3>{t("dcOutputHeader")}</h3>
							<div className="dc-pane-actions">
								<button
									onClick={handleCopyOutput}
									title={t("dcCopyOutputTitle")}
									disabled={!outputText}
								>
									<i className="fas fa-copy"></i>
								</button>
							</div>
						</div>
						<textarea
							className="dc-textarea"
							value={outputText}
							readOnly
							placeholder={t("dcOutputPlaceholder", { format: outputFormat.toUpperCase() })}
							spellCheck="false"
						/>
					</div>
				</div>

				<div className="dc-process-bar">
					<button onClick={convertData} className="tool-btn">
						<i className="fas fa-cogs"></i> {t("dcConvertBtn")}
					</button>
				</div>
			</main>
		</div>
	);
};
export default DataConverterPage;
