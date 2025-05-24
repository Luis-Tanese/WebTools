import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { unitCategories, convertUnit } from "../utils/unitsData";
import "../css/unit-converter.css";

const UnitConverterPage = () => {
	const { t } = useTranslation();

	const categoryKeys = Object.keys(unitCategories);
	const [selectedCategory, setSelectedCategory] = useState(categoryKeys[0]);

	const getUnitsForCategory = (categoryKey) => Object.keys(unitCategories[categoryKey]?.units || {});

	const [fromUnit, setFromUnit] = useState(getUnitsForCategory(categoryKeys[0])[0]);
	const [toUnit, setToUnit] = useState(
		getUnitsForCategory(categoryKeys[0])[1] || getUnitsForCategory(categoryKeys[0])[0]
	);

	const [inputValue, setInputValue] = useState("1");
	const [outputValue, setOutputValue] = useState("");

	useEffect(() => {
		const units = getUnitsForCategory(selectedCategory);
		setFromUnit(units[0] || "");
		setToUnit(units[1] || units[0] || "");
	}, [selectedCategory]);

	const performConversion = useCallback(() => {
		if (inputValue.trim() === "" || isNaN(parseFloat(inputValue))) {
			setOutputValue("");
			return;
		}
		const result = convertUnit(inputValue, fromUnit, toUnit, selectedCategory);
		if (result !== null) {
			setOutputValue(result.toString());
		} else {
			setOutputValue(t("ucErrorConversion") || "Error");
		}
	}, [inputValue, fromUnit, toUnit, selectedCategory, t]);

	useEffect(() => {
		performConversion();
	}, [performConversion]);

	const handleInputChange = (e) => {
		setInputValue(e.target.value);
	};

	const handleSwapUnits = () => {
		const currentFrom = fromUnit;
		const currentTo = toUnit;
		const currentInput = inputValue;
		const currentOutput = outputValue;

		setFromUnit(currentTo);
		setToUnit(currentFrom);
		if (currentOutput && !isNaN(parseFloat(currentOutput))) {
			setInputValue(currentOutput);
		} else {
			const result = convertUnit(currentInput, currentTo, currentFrom, selectedCategory);
			setOutputValue(result !== null ? result.toString() : t("ucErrorConversion") || "Error");
		}
	};

	const currentUnits = unitCategories[selectedCategory]?.units || {};

	return (
		<div className="container uc-container">
			<header className="tool-header">
				<h1>{t("ucPageTitle")}</h1>
				<p className="subtitle">{t("ucPageSubtitle")}</p>
			</header>

			<main className="uc-main">
				<div className="uc-category-selector">
					<label htmlFor="category-select">{t("ucSelectCategory")}:</label>
					<select
						id="category-select"
						value={selectedCategory}
						onChange={(e) => setSelectedCategory(e.target.value)}
					>
						{categoryKeys.map((catKey) => (
							<option key={catKey} value={catKey}>
								{t(unitCategories[catKey].labelKey)}
							</option>
						))}
					</select>
				</div>

				<div className="uc-conversion-area">
					<div className="uc-unit-group">
						<label htmlFor="from-unit-select">{t("ucFromUnit")}:</label>
						<input
							type="number"
							id="input-value"
							value={inputValue}
							onChange={handleInputChange}
							step="any"
						/>
						<select id="from-unit-select" value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}>
							{Object.keys(currentUnits).map((unitKey) => (
								<option key={`from-${unitKey}`} value={unitKey}>
									{t(currentUnits[unitKey].labelKey)} ({unitKey})
								</option>
							))}
						</select>
					</div>

					<button onClick={handleSwapUnits} className="tool-btn uc-swap-button" title={t("ucSwapUnitsTitle")}>
						<i className="fas fa-exchange-alt"></i>
					</button>

					<div className="uc-unit-group">
						<label htmlFor="to-unit-select">{t("ucToUnit")}:</label>
						<input type="number" id="output-value-display" value={outputValue} readOnly disabled />
						<select id="to-unit-select" value={toUnit} onChange={(e) => setToUnit(e.target.value)}>
							{Object.keys(currentUnits).map((unitKey) => (
								<option key={`to-${unitKey}`} value={unitKey}>
									{t(currentUnits[unitKey].labelKey)} ({unitKey})
								</option>
							))}
						</select>
					</div>
				</div>

				<div className="uc-result-area">
					<p>{t("ucResultLabel")}</p>
					<span className="result-value">{outputValue || "---"}</span>
					{outputValue && toUnit && currentUnits[toUnit] && (
						<p style={{ fontSize: "0.9em", opacity: 0.7, marginTop: "5px" }}>
							{t(currentUnits[toUnit].labelKey)}
						</p>
					)}
				</div>
			</main>
		</div>
	);
};

export default UnitConverterPage;
