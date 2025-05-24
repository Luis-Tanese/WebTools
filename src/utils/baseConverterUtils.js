export const CONVERSION_TYPES = {
	DECIMAL: { key: "DECIMAL", labelKey: "ubcTypeDecimal", base: 10, isNumeric: true },
	BINARY: { key: "BINARY", labelKey: "ubcTypeBinary", base: 2, isNumeric: true, charBits: 8 },
	HEXADECIMAL: { key: "HEXADECIMAL", labelKey: "ubcTypeHexadecimal", base: 16, isNumeric: true, charBits: 2 },
	OCTAL: { key: "OCTAL", labelKey: "ubcTypeOctal", base: 8, isNumeric: true, charBits: 3 }, 
	TEXT: { key: "TEXT", labelKey: "ubcTypeText", isNumeric: false },
	ASCII: { key: "ASCII", labelKey: "ubcTypeAscii", isNumeric: false }, 
};

const isValidNumberForBase = (value, base) => {
	if (value === null || value === undefined || String(value).trim() === "") return false;
	const strValue = String(value).toLowerCase();
	const validChars = "0123456789abcdef".substring(0, base);
	const regex = new RegExp(`^[${validChars}]+$`);
	return regex.test(strValue);
};

const textToCharCodes = (text, base, charBits = 8, separator = " ") => {
	return text
		.split("")
		.map((char) => {
			const code = char.charCodeAt(0);
			let numStr = code.toString(base);
			if (base === 2 && charBits) {
				numStr = numStr.padStart(charBits, "0");
			} else if (base === 16 && charBits) {
				numStr = numStr.padStart(charBits, "0");
			} else if (base === 8 && charBits) {
			}
			return numStr;
		})
		.join(separator);
};

const charCodesToText = (codesStr, base, charBits = 8, separatorPattern = /\s+/) => {
	const codes = codesStr.trim().split(separatorPattern);
	return codes
		.map((codeStr) => {
			const decimalCode = parseInt(codeStr, base);
			if (isNaN(decimalCode)) throw new Error("Invalid character code sequence.");
			return String.fromCharCode(decimalCode);
		})
		.join("");
};

export const convertValue = (value, fromTypeKey, toTypeKey) => {
	const fromType = CONVERSION_TYPES[fromTypeKey];
	const toType = CONVERSION_TYPES[toTypeKey];

	if (!fromType || !toType) throw new Error("Invalid conversion types.");
	if (String(value).trim() === "") return ""; 

	let intermediateDecimal; 
	switch (fromType.key) {
		case "DECIMAL":
			if (!/^-?\d+$/.test(value)) throw new Error("Invalid decimal number.");
			intermediateDecimal = parseInt(value, 10);
			break;
		case "BINARY":
			if (!isValidNumberForBase(value, 2)) throw new Error("Invalid binary number.");
			intermediateDecimal = parseInt(value, 2);
			break;
		case "HEXADECIMAL":
			if (!isValidNumberForBase(value, 16)) throw new Error("Invalid hexadecimal number.");
			intermediateDecimal = parseInt(value, 16);
			break;
		case "OCTAL":
			if (!isValidNumberForBase(value, 8)) throw new Error("Invalid octal number.");
			intermediateDecimal = parseInt(value, 8);
			break;
		case "TEXT":
			if (toType.key === "BINARY") return textToCharCodes(value, 2, fromType.charBits || 8);
			if (toType.key === "HEXADECIMAL") return textToCharCodes(value, 16, fromType.charBits || 2);
			if (toType.key === "OCTAL") return textToCharCodes(value, 8, fromType.charBits || 3);
			if (toType.key === "ASCII") return textToCharCodes(value, 10, null, " ");
			if (toType.key === "DECIMAL") {
				return String(value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0));
			}
			throw new Error(
				`Direct conversion from ${fromType.labelKey} to ${toType.labelKey} not standard for multi-char text. Try via ASCII or individual chars.`
			);
		case "ASCII":
			if (toType.key === "TEXT") return charCodesToText(value, 10);
			const asciiCodes = value
				.trim()
				.split(/\s+/)
				.map((c) => parseInt(c, 10));
			if (asciiCodes.some(isNaN)) throw new Error("Invalid ASCII code sequence.");
			if (asciiCodes.length === 0) throw new Error("Empty ASCII input.");
			intermediateDecimal = asciiCodes[0]; 
			if (asciiCodes.length > 1 && toType.isNumeric) {
				console.warn("Multiple ASCII codes found for numeric conversion, using the first one.");
			}
			break;
		default:
			throw new Error('Unsupported "From" type.');
	}

	if (isNaN(intermediateDecimal) && fromType.isNumeric) throw new Error("Intermediate decimal conversion failed.");

	switch (toType.key) {
		case "DECIMAL":
			return String(intermediateDecimal);
		case "BINARY":
			return intermediateDecimal.toString(2);
		case "HEXADECIMAL":
			return intermediateDecimal.toString(16).toUpperCase();
		case "OCTAL":
			return intermediateDecimal.toString(8);
		case "TEXT":
			if (fromType.isNumeric || fromType.key === "ASCII") {
				if (intermediateDecimal < 0 || intermediateDecimal > 0x10ffff)
					throw new Error("Decimal value out of Unicode range.");
				return String.fromCharCode(intermediateDecimal);
			}
			throw new Error("Cannot directly convert arbitrary number to multi-character text here.");
		case "ASCII":
			if (fromType.isNumeric || fromType.key === "ASCII") {
				return String(intermediateDecimal);
			}
			throw new Error("Cannot convert to ASCII codes from this state.");

		default:
			throw new Error('Unsupported "To" type.');
	}
};

export const handleTextSpecificConversions = (value, fromTypeKey, toTypeKey) => {
	const fromType = CONVERSION_TYPES[fromTypeKey];
	const toType = CONVERSION_TYPES[toTypeKey];

	if (fromType.key === "TEXT") {
		switch (toType.key) {
			case "BINARY":
				return textToCharCodes(value, 2, 8);
			case "HEXADECIMAL":
				return textToCharCodes(value, 16, 2); 
			case "OCTAL":
				return textToCharCodes(value, 8, 3);
			case "ASCII":
				return textToCharCodes(value, 10, null, " ");
			case "DECIMAL":
				return String(value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0));
			default:
				return null;
		}
	} else if (toType.key === "TEXT") {
		switch (fromType.key) {
			case "BINARY":
				return charCodesToText(value, 2, 8);
			case "HEXADECIMAL":
				return charCodesToText(value, 16, 2);
			case "OCTAL":
				return charCodesToText(value, 8, 3);
			case "ASCII":
				return charCodesToText(value, 10);
			case "DECIMAL":
				const num = parseInt(value, 10);
				if (isNaN(num) || num < 0 || num > 0x10ffff) throw new Error("Invalid decimal for text conversion.");
				return String.fromCharCode(num);
			default:
				return null;
		}
	}
	return null
};
