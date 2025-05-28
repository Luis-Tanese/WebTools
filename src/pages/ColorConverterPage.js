import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { useToast } from "../hooks/useToast";
import {
	parseHex,
	parseRgb,
	parseHsl,
	parseCssColorName,
	hslToRgb,
	updateAllFormatsFromRgb,
	rgbToHsl,
} from "../utils/colorUtils";
import "../css/color-converter.css";

const initialRgb = { r: 255, g: 0, b: 0, a: 1 };

const ColorConverterPage = () => {
	const { t } = useTranslation();
	const { showToast } = useToast();

	const [currentColorRgb, setCurrentColorRgb] = useState(initialRgb);

	const [outputFormats, setOutputFormats] = useState(() => updateAllFormatsFromRgb(initialRgb));
	const [hexInput, setHexInput] = useState(outputFormats.hex || "");
	const [rgbInput, setRgbInput] = useState(outputFormats.rgba || "");
	const [hslInput, setHslInput] = useState(outputFormats.hsla || "");
	const [cssNameInput, setCssNameInput] = useState("red");

	const [activeInput, setActiveInput] = useState(null);

	const syncAllFromRgb = useCallback((newRgb, currentlyEditing) => {
		if (newRgb && typeof newRgb.r !== "undefined") {
			const formats = updateAllFormatsFromRgb(newRgb);
			setOutputFormats(formats);
			setCurrentColorRgb(newRgb);

			if (currentlyEditing !== "hex") setHexInput(formats.hex);
			if (currentlyEditing !== "rgb")
				setRgbInput(
					formats.rgba === `rgba(${newRgb.r}, ${newRgb.g}, ${newRgb.b}, 1)` ? formats.rgb : formats.rgba
				);

			const newHsl = formats.currentRgb ? rgbToHsl(formats.currentRgb) : { h: 0, s: 0, l: 0, a: 1 };
			if (currentlyEditing !== "hsl")
				setHslInput(
					formats.hsla === `hsla(${newHsl.h}, ${newHsl.s}%, ${newHsl.l}%, 1)` ? formats.hsl : formats.hsla
				);
		} else {
			setOutputFormats(updateAllFormatsFromRgb(null));
		}
	}, []);

	useEffect(() => {
		if (activeInput !== "picker") {
			syncAllFromRgb(currentColorRgb, activeInput);
		} else {
			const formats = updateAllFormatsFromRgb(currentColorRgb);
			setOutputFormats(formats);
		}
	}, [currentColorRgb, syncAllFromRgb, activeInput]);

	const handleInputChange = (inputType, value) => {
		setActiveInput(inputType);
		let newRgb = null;
		let isValidInputForType = true;

		switch (inputType) {
			case "hex":
				setHexInput(value);
				newRgb = parseHex(value);
				if (value.trim() !== "" && !newRgb) isValidInputForType = false;
				break;
			case "rgb":
				setRgbInput(value);
				newRgb = parseRgb(value);
				if (value.trim() !== "" && !newRgb) isValidInputForType = false;
				break;
			case "hsl":
				setHslInput(value);
				const parsedHsl = parseHsl(value);
				if (parsedHsl) newRgb = hslToRgb(parsedHsl);
				if (value.trim() !== "" && !parsedHsl) isValidInputForType = false;
				break;
			case "cssName":
				setCssNameInput(value);
				newRgb = parseCssColorName(value);
				if (value.trim() !== "" && !newRgb) isValidInputForType = false;
				break;
			case "picker":
				setHexInput(value);
				newRgb = parseHex(value);
				if (value.trim() !== "" && !newRgb) isValidInputForType = false;
				break;
			default:
				break;
		}

		if (newRgb) {
			if (
				newRgb.r > 255 ||
				newRgb.g > 255 ||
				newRgb.b > 255 ||
				newRgb.r < 0 ||
				newRgb.g < 0 ||
				newRgb.b < 0 ||
				newRgb.a < 0 ||
				newRgb.a > 1
			) {
				showToast(t("ccErrorInvalidValue"), "error");
			} else {
				setCurrentColorRgb(newRgb);
			}
		} else if (!isValidInputForType && value.trim() !== "") {
			showToast(t("ccErrorInvalidFormat", { format: inputType.toUpperCase() }), "error");
		}
	};

	const handleInputFocus = (inputType) => {
		setActiveInput(inputType);
	};

	const handleInputBlur = () => {
		setActiveInput(null);
		syncAllFromRgb(currentColorRgb, null);
	};

	const handleCopy = (textToCopy) => {
		if (textToCopy) {
			navigator.clipboard
				.writeText(textToCopy)
				.then(() => {
					showToast(t("ccCopiedSuccess", { value: textToCopy }), "success");
				})
				.catch(() => showToast(t("ccErrorCopying"), "error"));
		}
	};

	return (
		<div className="container cc-container">
			<header className="tool-header">
				<h1>{t("ccPageTitle")}</h1>
				<p className="subtitle">{t("ccPageSubtitle")}</p>
			</header>

			<main className="cc-main">
				<div className="cc-input-section">
					<div className="cc-input-group">
						<label htmlFor="hex-input">HEX</label>
						<input
							type="text"
							id="hex-input"
							value={hexInput}
							onChange={(e) => handleInputChange("hex", e.target.value)}
							onFocus={() => handleInputFocus("hex")}
							onBlur={handleInputBlur}
							placeholder="#RRGGBB(AA)"
						/>
					</div>
					<div className="cc-input-group">
						<label htmlFor="rgb-input">RGB(A)</label>
						<input
							type="text"
							id="rgb-input"
							value={rgbInput}
							onChange={(e) => handleInputChange("rgb", e.target.value)}
							onFocus={() => handleInputFocus("rgb")}
							onBlur={handleInputBlur}
							placeholder="rgb(R, G, B)"
						/>
					</div>
					<div className="cc-input-group">
						<label htmlFor="hsl-input">HSL(A)</label>
						<input
							type="text"
							id="hsl-input"
							value={hslInput}
							onChange={(e) => handleInputChange("hsl", e.target.value)}
							onFocus={() => handleInputFocus("hsl")}
							onBlur={handleInputBlur}
							placeholder="hsl(H, S%, L%)"
						/>
					</div>
					<div className="cc-input-group">
						<label htmlFor="css-name-input">{t("ccCssNameLabel")}</label>
						<input
							type="text"
							id="css-name-input"
							value={cssNameInput}
							onChange={(e) => handleInputChange("cssName", e.target.value)}
							onFocus={() => handleInputFocus("cssName")}
							onBlur={handleInputBlur}
							placeholder="e.g., red, lightblue"
						/>
					</div>
				</div>

				<div className="cc-color-preview-section">
					<div className="cc-color-preview-box">
						<div
							className="color-overlay"
							style={{ backgroundColor: outputFormats.rgba || "transparent" }}
						></div>
					</div>
					<input
						type="color"
						id="color-picker-input"
						value={outputFormats.hex ? outputFormats.hex.substring(0, 7) : "#000000"}
						onChange={(e) => {
							setActiveInput("picker");
							handleInputChange("picker", e.target.value);
						}}
						onBlur={handleInputBlur}
						aria-label={t("ccColorPickerLabel")}
					/>
				</div>

				<div className="cc-output-section">
					<h3>{t("ccOutputFormatsHeader")}</h3>
					<div className="output-format-grid">
						{outputFormats.hex && (
							<OutputFormatItem label="HEX" value={outputFormats.hex} onCopy={handleCopy} />
						)}
						{outputFormats.rgba && (
							<OutputFormatItem label="RGBA" value={outputFormats.rgba} onCopy={handleCopy} />
						)}
						{outputFormats.rgb && (
							<OutputFormatItem label="RGB" value={outputFormats.rgb} onCopy={handleCopy} />
						)}
						{outputFormats.hsla && (
							<OutputFormatItem label="HSLA" value={outputFormats.hsla} onCopy={handleCopy} />
						)}
						{outputFormats.hsl && (
							<OutputFormatItem label="HSL" value={outputFormats.hsl} onCopy={handleCopy} />
						)}
						{outputFormats.hsv && (
							<OutputFormatItem label="HSV/HSB" value={outputFormats.hsv} onCopy={handleCopy} />
						)}
					</div>
				</div>
			</main>
		</div>
	);
};

const OutputFormatItem = ({ label, value, onCopy }) => (
	<div className="output-format-item">
		<span className="format-label">{label}:</span>
		<input type="text" className="format-value" value={value || ""} readOnly />
		<button className="copy-btn-small" onClick={() => onCopy(value)} title={`Copy ${label}`} disabled={!value}>
			<i className="fas fa-copy"></i>
		</button>
	</div>
);

export default ColorConverterPage;
