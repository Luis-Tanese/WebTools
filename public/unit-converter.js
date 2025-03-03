const elements = {
    categorySelect: document.getElementById("category-select"),
    fromValue: document.getElementById("from-value"),
    toValue: document.getElementById("to-value"),
    fromUnit: document.getElementById("from-unit"),
    toUnit: document.getElementById("to-unit"),
    swapBtn: document.getElementById("swap-btn"),
    copyBtn: document.getElementById("copy-btn"),
    clearBtn: document.getElementById("clear-btn"),
    commonConversions: document.getElementById("common-conversions"),
};

const unitData = {
    length: {
        name: "Length",
        units: {
            mm: { name: "Millimeters", factor: 0.001 },
            cm: { name: "Centimeters", factor: 0.01 },
            m: { name: "Meters", factor: 1 },
            km: { name: "Kilometers", factor: 1000 },
            in: { name: "Inches", factor: 0.0254 },
            ft: { name: "Feet", factor: 0.3048 },
            yd: { name: "Yards", factor: 0.9144 },
            mi: { name: "Miles", factor: 1609.344 },
        },
    },
    area: {
        name: "Area",
        units: {
            mm2: { name: "Square Millimeters", factor: 0.000001 },
            cm2: { name: "Square Centimeters", factor: 0.0001 },
            m2: { name: "Square Meters", factor: 1 },
            km2: { name: "Square Kilometers", factor: 1000000 },
            ha: { name: "Hectares", factor: 10000 },
            in2: { name: "Square Inches", factor: 0.00064516 },
            ft2: { name: "Square Feet", factor: 0.092903 },
            ac: { name: "Acres", factor: 4046.86 },
        },
    },
    volume: {
        name: "Volume",
        units: {
            ml: { name: "Milliliters", factor: 0.001 },
            l: { name: "Liters", factor: 1 },
            m3: { name: "Cubic Meters", factor: 1000 },
            gal: { name: "Gallons (US)", factor: 3.78541 },
            qt: { name: "Quarts (US)", factor: 0.946353 },
            pt: { name: "Pints (US)", factor: 0.473176 },
            fl_oz: { name: "Fluid Ounces (US)", factor: 0.0295735 },
        },
    },
    mass: {
        name: "Mass/Weight",
        units: {
            mg: { name: "Milligrams", factor: 0.001 },
            g: { name: "Grams", factor: 1 },
            kg: { name: "Kilograms", factor: 1000 },
            oz: { name: "Ounces", factor: 28.3495 },
            lb: { name: "Pounds", factor: 453.592 },
            st: { name: "Stone", factor: 6350.29 },
            t: { name: "Metric Tons", factor: 1000000 },
        },
    },
    temperature: {
        name: "Temperature",
        units: {
            c: { name: "Celsius" },
            f: { name: "Fahrenheit" },
            k: { name: "Kelvin" },
        },
    },
    time: {
        name: "Time",
        units: {
            ms: { name: "Milliseconds", factor: 0.001 },
            s: { name: "Seconds", factor: 1 },
            min: { name: "Minutes", factor: 60 },
            h: { name: "Hours", factor: 3600 },
            d: { name: "Days", factor: 86400 },
            wk: { name: "Weeks", factor: 604800 },
            mo: { name: "Months (avg)", factor: 2629746 },
            y: { name: "Years", factor: 31556952 },
        },
    },
    speed: {
        name: "Speed",
        units: {
            mps: { name: "Meters per Second", factor: 1 },
            kph: { name: "Kilometers per Hour", factor: 0.277778 },
            mph: { name: "Miles per Hour", factor: 0.44704 },
            fps: { name: "Feet per Second", factor: 0.3048 },
            knot: { name: "Knots", factor: 0.514444 },
        },
    },
    pressure: {
        name: "Pressure",
        units: {
            pa: { name: "Pascal", factor: 1 },
            kpa: { name: "Kilopascal", factor: 1000 },
            bar: { name: "Bar", factor: 100000 },
            psi: { name: "PSI", factor: 6894.76 },
            atm: { name: "Atmosphere", factor: 101325 },
        },
    },
    energy: {
        name: "Energy",
        units: {
            j: { name: "Joules", factor: 1 },
            kj: { name: "Kilojoules", factor: 1000 },
            cal: { name: "Calories", factor: 4.184 },
            kcal: { name: "Kilocalories", factor: 4184 },
            wh: { name: "Watt Hours", factor: 3600 },
            kwh: { name: "Kilowatt Hours", factor: 3600000 },
        },
    },
    power: {
        name: "Power",
        units: {
            w: { name: "Watts", factor: 1 },
            kw: { name: "Kilowatts", factor: 1000 },
            hp: { name: "Horsepower", factor: 745.7 },
            btu: { name: "BTU/hour", factor: 0.29307107 },
        },
    },
    data: {
        name: "Digital Storage",
        units: {
            b: { name: "Bytes", factor: 1 },
            kb: { name: "Kilobytes", factor: 1024 },
            mb: { name: "Megabytes", factor: 1048576 },
            gb: { name: "Gigabytes", factor: 1073741824 },
            tb: { name: "Terabytes", factor: 1099511627776 },
        },
    },
    angle: {
        name: "Angle",
        units: {
            deg: { name: "Degrees", factor: 1 },
            rad: { name: "Radians", factor: 57.2958 },
            grad: { name: "Gradians", factor: 0.9 },
            arcmin: { name: "Arc Minutes", factor: 0.0166667 },
            arcsec: { name: "Arc Seconds", factor: 0.000277778 },
        },
    },
};

const commonConversions = {
    length: [
        { from: "m", to: "ft", value: 1 },
        { from: "km", to: "mi", value: 1 },
        { from: "cm", to: "in", value: 1 },
    ],
    area: [
        { from: "m2", to: "ft2", value: 1 },
        { from: "km2", to: "mi2", value: 1 },
        { from: "ha", to: "ac", value: 1 },
    ],
    volume: [
        { from: "l", to: "gal", value: 1 },
        { from: "ml", to: "fl_oz", value: 1 },
    ],
    mass: [
        { from: "kg", to: "lb", value: 1 },
        { from: "g", to: "oz", value: 1 },
    ],
    temperature: [
        { from: "c", to: "f", value: 0 },
        { from: "c", to: "k", value: 0 },
        { from: "f", to: "c", value: 32 },
    ],
    time: [
        { from: "h", to: "min", value: 1 },
        { from: "d", to: "h", value: 1 },
    ],
    speed: [
        { from: "kph", to: "mph", value: 100 },
        { from: "mps", to: "fps", value: 1 },
    ],
    pressure: [
        { from: "bar", to: "psi", value: 1 },
        { from: "kpa", to: "psi", value: 100 },
    ],
    energy: [
        { from: "kj", to: "kcal", value: 1 },
        { from: "j", to: "cal", value: 1000 },
    ],
    power: [
        { from: "kw", to: "hp", value: 1 },
        { from: "w", to: "btu", value: 1000 },
    ],
    data: [
        { from: "mb", to: "kb", value: 1 },
        { from: "gb", to: "mb", value: 1 },
    ],
    angle: [
        { from: "deg", to: "rad", value: 90 },
        { from: "deg", to: "grad", value: 45 },
    ],
};

const temperatureConversions = {
    c_to_f: (celsius) => (celsius * 9) / 5 + 32,
    f_to_c: (fahrenheit) => ((fahrenheit - 32) * 5) / 9,
    c_to_k: (celsius) => celsius + 273.15,
    k_to_c: (kelvin) => kelvin - 273.15,
    f_to_k: (fahrenheit) => ((fahrenheit - 32) * 5) / 9 + 273.15,
    k_to_f: (kelvin) => ((kelvin - 273.15) * 9) / 5 + 32,
};

const populateUnitDropdowns = (category) => {
    const units = unitData[category].units;

    elements.fromUnit.innerHTML = "";
    elements.toUnit.innerHTML = "";

    for (const [code, unit] of Object.entries(units)) {
        const fromOption = document.createElement("option");
        fromOption.value = code;
        fromOption.textContent = unit.name;
        elements.fromUnit.appendChild(fromOption);

        const toOption = document.createElement("option");
        toOption.value = code;
        toOption.textContent = unit.name;
        elements.toUnit.appendChild(toOption);
    }

    if (elements.toUnit.options.length > 1) {
        elements.toUnit.selectedIndex = 1;
    }

    updateCommonConversions(category);
};

const updateCommonConversions = (category) => {
    elements.commonConversions.innerHTML = "";

    if (!commonConversions[category]) return;

    commonConversions[category].forEach((conversion) => {
        const result = convert(
            conversion.value,
            conversion.from,
            conversion.to,
            category
        );

        const conversionEl = document.createElement("div");
        conversionEl.className = "common-conversion";
        conversionEl.innerHTML = `
            <div class="common-conversion-label">
                ${conversion.value} ${
            unitData[category].units[conversion.from].name
        } =
            </div>
            <div class="common-conversion-value">
                ${formatNumber(result)} ${
            unitData[category].units[conversion.to].name
        }
            </div>
        `;

        conversionEl.addEventListener("click", () => {
            elements.fromValue.value = conversion.value;
            elements.fromUnit.value = conversion.from;
            elements.toUnit.value = conversion.to;
            updateResult();
        });

        elements.commonConversions.appendChild(conversionEl);
    });
};

const formatNumber = (num) => {
    if (Math.abs(num) < 0.000001 && num !== 0) {
        return num.toExponential(6);
    }

    if (Math.abs(num) > 1e9) {
        return num.toExponential(6);
    }

    const rounded = parseFloat(num.toFixed(6));
    return rounded.toString().replace(/\.0+$/, "");
};

const convert = (value, fromUnit, toUnit, category) => {
    if (isNaN(value)) return 0;

    if (category === "temperature") {
        if (fromUnit === toUnit) return value;

        const conversionKey = `${fromUnit}_to_${toUnit}`;
        if (temperatureConversions[conversionKey]) {
            return temperatureConversions[conversionKey](parseFloat(value));
        }
    }

    const fromFactor = unitData[category].units[fromUnit].factor;
    const toFactor = unitData[category].units[toUnit].factor;

    return (value * fromFactor) / toFactor;
};

const updateResult = () => {
    const category = elements.categorySelect.value;
    const fromValue = parseFloat(elements.fromValue.value);
    const fromUnit = elements.fromUnit.value;
    const toUnit = elements.toUnit.value;

    if (isNaN(fromValue)) {
        elements.toValue.value = "";
        return;
    }

    const result = convert(fromValue, fromUnit, toUnit, category);
    elements.toValue.value = formatNumber(result);
};

const init = () => {
    populateUnitDropdowns(elements.categorySelect.value);

    elements.categorySelect.addEventListener("change", () => {
        populateUnitDropdowns(elements.categorySelect.value);
        updateResult();
    });

    elements.fromValue.addEventListener("input", updateResult);
    elements.fromUnit.addEventListener("change", updateResult);
    elements.toUnit.addEventListener("change", updateResult);

    elements.swapBtn.addEventListener("click", () => {
        const tempUnit = elements.fromUnit.value;
        elements.fromUnit.value = elements.toUnit.value;
        elements.toUnit.value = tempUnit;

        updateResult();
    });

    elements.copyBtn.addEventListener("click", () => {
        if (!elements.toValue.value) return;

        navigator.clipboard
            .writeText(elements.toValue.value)
            .then(() => {
                alert("Result copied to clipboard!");
            })
            .catch((err) => {
                console.error("Failed to copy result: ", err);
                alert("Failed to copy result to clipboard");
            });
    });

    elements.clearBtn.addEventListener("click", () => {
        elements.fromValue.value = "";
        elements.toValue.value = "";
    });

    if (elements.fromValue.value) {
        updateResult();
    }
};

document.addEventListener("DOMContentLoaded", init);
