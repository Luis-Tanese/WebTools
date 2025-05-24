export const unitCategories = {
	length: {
		labelKey: "ucCategoryLength",
		baseUnit: "m",
		units: {
			m: { labelKey: "ucUnitMeter", factor: 1 },
			km: { labelKey: "ucUnitKilometer", factor: 1000 },
			cm: { labelKey: "ucUnitCentimeter", factor: 0.01 },
			mm: { labelKey: "ucUnitMillimeter", factor: 0.001 },
			mi: { labelKey: "ucUnitMile", factor: 1609.34 },
			yd: { labelKey: "ucUnitYard", factor: 0.9144 },
			ft: { labelKey: "ucUnitFoot", factor: 0.3048 },
			in: { labelKey: "ucUnitInch", factor: 0.0254 },
		},
	},
	mass: {
		labelKey: "ucCategoryMass",
		baseUnit: "kg",
		units: {
			kg: { labelKey: "ucUnitKilogram", factor: 1 },
			g: { labelKey: "ucUnitGram", factor: 0.001 },
			mg: { labelKey: "ucUnitMilligram", factor: 0.000001 },
			t: { labelKey: "ucUnitMetricTon", factor: 1000 },
			lb: { labelKey: "ucUnitPound", factor: 0.453592 },
			oz: { labelKey: "ucUnitOunce", factor: 0.0283495 },
		},
	},
	temperature: {
		labelKey: "ucCategoryTemperature",
		baseUnit: "c",
		units: {
			c: { labelKey: "ucUnitCelsius", toBase: (val) => val, fromBase: (val) => val },
			f: {
				labelKey: "ucUnitFahrenheit",
				toBase: (val) => ((val - 32) * 5) / 9,
				fromBase: (val) => (val * 9) / 5 + 32,
			},
			k: { labelKey: "ucUnitKelvin", toBase: (val) => val - 273.15, fromBase: (val) => val + 273.15 },
		},
	},
	speed: {
		labelKey: "ucCategorySpeed",
		baseUnit: "mps",
		units: {
			mps: { labelKey: "ucUnitMetersPerSecond", factor: 1 },
			kmh: { labelKey: "ucUnitKilometersPerHour", factor: 1 / 3.6 },
			mph: { labelKey: "ucUnitMilesPerHour", factor: 0.44704 },
			kn: { labelKey: "ucUnitKnot", factor: 0.514444 },
		},
	},
	digitalStorage: {
		labelKey: "ucCategoryDigitalStorage",
		baseUnit: "B",
		units: {
			B: { labelKey: "ucUnitByte", factor: 1 },
			KB: { labelKey: "ucUnitKilobyte", factor: 1024 },
			MB: { labelKey: "ucUnitMegabyte", factor: 1024 ** 2 },
			GB: { labelKey: "ucUnitGigabyte", factor: 1024 ** 3 },
			TB: { labelKey: "ucUnitTerabyte", factor: 1024 ** 4 },
		},
	},
};

export const convertUnit = (value, fromUnit, toUnit, category) => {
	if (isNaN(parseFloat(value))) return null;

	const numericValue = parseFloat(value);
	const categoryData = unitCategories[category];

	if (!categoryData) return null;

	const from = categoryData.units[fromUnit];
	const to = categoryData.units[toUnit];

	if (!from || !to) return null;

	let valueInBaseUnit;
	if (category === "temperature") {
		valueInBaseUnit = from.toBase(numericValue);
	} else {
		valueInBaseUnit = numericValue * from.factor;
	}

	let result;
	if (category === "temperature") {
		result = to.fromBase(valueInBaseUnit);
	} else {
		result = valueInBaseUnit / to.factor;
	}

	if (Math.abs(result) < 0.00001 && result !== 0) {
		return parseFloat(result.toPrecision(4));
	}
	return parseFloat(result.toFixed(6));
};
