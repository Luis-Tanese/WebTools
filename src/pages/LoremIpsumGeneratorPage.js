import React, { useState, useCallback } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { useToast } from "../hooks/useToast";
import { generateLoremIpsum } from "../utils/loremUtils";
import "../css/lorem-ipsum-generator.css";

const LoremIpsumGeneratorPage = () => {
	const { t } = useTranslation();
	const { showToast } = useToast();
	const [generateType, setGenerateType] = useState("paragraphs");
	const [amount, setAmount] = useState(3);
	const [startWithLorem, setStartWithLorem] = useState(true);
	const [generatedText, setGeneratedText] = useState("");

	const handleGenerate = useCallback(() => {
		const numAmount = parseInt(amount, 10);
		if (isNaN(numAmount) || numAmount <= 0) {
			showToast("Please enter a valid positive amount.", "error");
			setGeneratedText("");
			return;
		}
		const options = {
			type: generateType,
			amount: numAmount,
			startWithClassic: startWithLorem,
		};
		const text = generateLoremIpsum(options);
		setGeneratedText(text);
	}, [generateType, amount, startWithLorem, showToast]);

	const handleCopy = () => {
		if (generatedText) {
			navigator.clipboard
				.writeText(generatedText)
				.then(() => {
					showToast(t("lipCopiedSuccess"), "success");
				})
				.catch(() => showToast(t("lipCopiedError"), "error"));
		}
	};

	useState(() => {
		handleGenerate();
	}, []);

	return (
		<div className="container lip-container">
			<header className="tool-header">
				<h1>{t("lipPageTitle")}</h1>
				<p className="subtitle">{t("lipPageSubtitle")}</p>
			</header>

			<main className="lip-main">
				<div className="lip-options-section">
					<div className="lip-option-group">
						<label htmlFor="generate-type">{t("lipGenerateTypeLabel")}</label>
						<select
							id="generate-type"
							value={generateType}
							onChange={(e) => setGenerateType(e.target.value)}
						>
							<option value="paragraphs">{t("lipTypeParagraphs")}</option>
							<option value="words">{t("lipTypeWords")}</option>
							<option value="bytes">{t("lipTypeBytes")}</option>
							<option value="list">{t("lipTypeList")}</option>
						</select>
					</div>
					<div className="lip-option-group">
						<label htmlFor="amount">{t("lipAmountLabel")}</label>
						<input
							type="number"
							id="amount"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							min="1"
						/>
					</div>
					<div className="lip-option-group lip-checkbox-group">
						<input
							type="checkbox"
							id="start-with-lorem"
							checked={startWithLorem}
							onChange={(e) => setStartWithLorem(e.target.checked)}
						/>
						<label htmlFor="start-with-lorem">{t("lipStartWithLoremLabel")}</label>
					</div>
					<button onClick={handleGenerate} className="tool-btn lip-generate-btn">
						<i className="fas fa-cogs"></i> {t("lipGenerateButton")}
					</button>
				</div>

				<div className="lip-output-section">
					<div className="lip-output-header">
						<h3>{t("lipOutputLabel")}</h3>
						<button
							onClick={handleCopy}
							className="tool-btn-secondary lip-copy-btn"
							disabled={!generatedText}
						>
							<i className="fas fa-copy"></i> {t("lipCopyButton")}
						</button>
					</div>
					<textarea id="lorem-output" value={generatedText} readOnly rows="15" />
				</div>
			</main>
		</div>
	);
};

export default LoremIpsumGeneratorPage;
