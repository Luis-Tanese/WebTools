export const parseHex = (hex) => {
	if (typeof hex !== "string") return null;
	hex = hex.replace(/^#/, "");
	if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$|^[0-9A-Fa-f]{8}$/.test(hex)) return null;

	let r,
		g,
		b,
		a = 255;
	if (hex.length === 3) {
		r = parseInt(hex[0] + hex[0], 16);
		g = parseInt(hex[1] + hex[1], 16);
		b = parseInt(hex[2] + hex[2], 16);
	} else if (hex.length === 6) {
		r = parseInt(hex.substring(0, 2), 16);
		g = parseInt(hex.substring(2, 4), 16);
		b = parseInt(hex.substring(4, 6), 16);
	} else if (hex.length === 8) {
		r = parseInt(hex.substring(0, 2), 16);
		g = parseInt(hex.substring(2, 4), 16);
		b = parseInt(hex.substring(4, 6), 16);
		a = parseInt(hex.substring(6, 8), 16);
	} else {
		return null;
	}
	if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) return null;
	return { r, g, b, a: a / 255 };
};

export const parseRgb = (rgbStr) => {
	if (typeof rgbStr !== "string") return null;
	const match = rgbStr.match(/^rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(?:,\s*([\d.]+))?\)$/i);
	if (!match) return null;
	const r = parseInt(match[1]);
	const g = parseInt(match[2]);
	const b = parseInt(match[3]);
	const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
	if (
		r > 255 ||
		g > 255 ||
		b > 255 ||
		r < 0 ||
		g < 0 ||
		b < 0 ||
		a < 0 ||
		a > 1 ||
		isNaN(r) ||
		isNaN(g) ||
		isNaN(b) ||
		isNaN(a)
	)
		return null;
	return { r, g, b, a };
};

export const parseHsl = (hslStr) => {
	if (typeof hslStr !== "string") return null;
	const match = hslStr.match(/^hsla?\((\d{1,3}),\s*([\d.]+)%?,\s*([\d.]+)%?(?:,\s*([\d.]+))?\)$/i);
	if (!match) return null;
	const h = parseInt(match[1]);
	const s = parseFloat(match[2]);
	const l = parseFloat(match[3]);
	const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
	if (
		h > 360 ||
		h < 0 ||
		s > 100 ||
		s < 0 ||
		l > 100 ||
		l < 0 ||
		a < 0 ||
		a > 1 ||
		isNaN(h) ||
		isNaN(s) ||
		isNaN(l) ||
		isNaN(a)
	)
		return null;
	return { h, s: s / 100, l: l / 100, a };
};

export const rgbToHex = ({ r, g, b, a }) => {
	const toHexByte = (c) => {
		const hex = Math.round(c).toString(16);
		return hex.length === 1 ? "0" + hex : hex;
	};
	let hexString = `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;
	if (typeof a === "number" && a < 1) {
		hexString += toHexByte(a * 255);
	}
	return hexString.toUpperCase();
};

export const rgbToHsl = ({ r, g, b, a }) => {
	const r1 = r / 255;
	const g1 = g / 255;
	const b1 = b / 255;
	const max = Math.max(r1, g1, b1),
		min = Math.min(r1, g1, b1);
	let h,
		s,
		l = (max + min) / 2;

	if (max === min) {
		h = s = 0;
	} else {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r1:
				h = (g1 - b1) / d + (g1 < b1 ? 6 : 0);
				break;
			case g1:
				h = (b1 - r1) / d + 2;
				break;
			case b1:
				h = (r1 - g1) / d + 4;
				break;
			default:
				h = 0;
		}
		h /= 6;
	}
	return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100), a };
};

export const hslToRgb = ({ h, s, l, a }) => {
	let r, g, b;
	const sNorm = s;
	const lNorm = l;

	if (sNorm === 0) {
		r = g = b = lNorm;
	} else {
		const hueToRgb = (p, q, t) => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};
		const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
		const p = 2 * lNorm - q;
		const hNorm = h / 360;
		r = hueToRgb(p, q, hNorm + 1 / 3);
		g = hueToRgb(p, q, hNorm);
		b = hueToRgb(p, q, hNorm - 1 / 3);
	}
	return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255), a };
};

export const rgbToHsv = ({ r, g, b, a }) => {
	const r1 = r / 255;
	const g1 = g / 255;
	const b1 = b / 255;
	const max = Math.max(r1, g1, b1),
		min = Math.min(r1, g1, b1);
	let h,
		s,
		v = max;
	const d = max - min;
	s = max === 0 ? 0 : d / max;

	if (max === min) {
		h = 0;
	} else {
		switch (max) {
			case r1:
				h = (g1 - b1) / d + (g1 < b1 ? 6 : 0);
				break;
			case g1:
				h = (b1 - r1) / d + 2;
				break;
			case b1:
				h = (r1 - g1) / d + 4;
				break;
			default:
				h = 0;
		}
		h /= 6;
	}
	return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100), a };
};

const cssColorNames = {
	aliceblue: "#F0F8FF",
	antiquewhite: "#FAEBD7",
	aqua: "#00FFFF",
	aquamarine: "#7FFFD4",
	azure: "#F0FFFF",
	beige: "#F5F5DC",
	bisque: "#FFE4C4",
	black: "#000000",
	blanchedalmond: "#FFEBCD",
	blue: "#0000FF",
	blueviolet: "#8A2BE2",
	brown: "#A52A2A",
	burlywood: "#DEB887",
	cadetblue: "#5F9EA0",
	chartreuse: "#7FFF00",
	chocolate: "#D2691E",
	coral: "#FF7F50",
	cornflowerblue: "#6495ED",
	cornsilk: "#FFF8DC",
	crimson: "#DC143C",
	cyan: "#00FFFF",
	darkblue: "#00008B",
	darkcyan: "#008B8B",
	darkgoldenrod: "#B8860B",
	darkgray: "#A9A9A9",
	darkgreen: "#006400",
	darkgrey: "#A9A9A9",
	darkkhaki: "#BDB76B",
	darkmagenta: "#8B008B",
	darkolivegreen: "#556B2F",
	darkorange: "#FF8C00",
	darkorchid: "#9932CC",
	darkred: "#8B0000",
	darksalmon: "#E9967A",
	darkseagreen: "#8FBC8F",
	darkslateblue: "#483D8B",
	darkslategray: "#2F4F4F",
	darkslategrey: "#2F4F4F",
	darkturquoise: "#00CED1",
	darkviolet: "#9400D3",
	deeppink: "#FF1493",
	deepskyblue: "#00BFFF",
	dimgray: "#696969",
	dimgrey: "#696969",
	dodgerblue: "#1E90FF",
	firebrick: "#B22222",
	floralwhite: "#FFFAF0",
	forestgreen: "#228B22",
	fuchsia: "#FF00FF",
	gainsboro: "#DCDCDC",
	ghostwhite: "#F8F8FF",
	gold: "#FFD700",
	goldenrod: "#DAA520",
	gray: "#808080",
	green: "#008000",
	greenyellow: "#ADFF2F",
	grey: "#808080",
	honeydew: "#F0FFF0",
	hotpink: "#FF69B4",
	indianred: "#CD5C5C",
	indigo: "#4B0082",
	ivory: "#FFFFF0",
	khaki: "#F0E68C",
	lavender: "#E6E6FA",
	lavenderblush: "#FFF0F5",
	lawngreen: "#7CFC00",
	lemonchiffon: "#FFFACD",
	lightblue: "#ADD8E6",
	lightcoral: "#F08080",
	lightcyan: "#E0FFFF",
	lightgoldenrodyellow: "#FAFAD2",
	lightgray: "#D3D3D3",
	lightgreen: "#90EE90",
	lightgrey: "#D3D3D3",
	lightpink: "#FFB6C1",
	lightsalmon: "#FFA07A",
	lightseagreen: "#20B2AA",
	lightskyblue: "#87CEFA",
	lightslategray: "#778899",
	lightslategrey: "#778899",
	lightsteelblue: "#B0C4DE",
	lightyellow: "#FFFFE0",
	lime: "#00FF00",
	limegreen: "#32CD32",
	linen: "#FAF0E6",
	magenta: "#FF00FF",
	maroon: "#800000",
	mediumaquamarine: "#66CDAA",
	mediumblue: "#0000CD",
	mediumorchid: "#BA55D3",
	mediumpurple: "#9370DB",
	mediumseagreen: "#3CB371",
	mediumslateblue: "#7B68EE",
	mediumspringgreen: "#00FA9A",
	mediumturquoise: "#48D1CC",
	mediumvioletred: "#C71585",
	midnightblue: "#191970",
	mintcream: "#F5FFFA",
	mistyrose: "#FFE4E1",
	moccasin: "#FFE4B5",
	navajowhite: "#FFDEAD",
	navy: "#000080",
	oldlace: "#FDF5E6",
	olive: "#808000",
	olivedrab: "#6B8E23",
	orange: "#FFA500",
	orangered: "#FF4500",
	orchid: "#DA70D6",
	palegoldenrod: "#EEE8AA",
	palegreen: "#98FB98",
	paleturquoise: "#AFEEEE",
	palevioletred: "#DB7093",
	papayawhip: "#FFEFD5",
	peachpuff: "#FFDAB9",
	peru: "#CD853F",
	pink: "#FFC0CB",
	plum: "#DDA0DD",
	powderblue: "#B0E0E6",
	purple: "#800080",
	rebeccapurple: "#663399",
	red: "#FF0000",
	rosybrown: "#BC8F8F",
	royalblue: "#4169E1",
	saddlebrown: "#8B4513",
	salmon: "#FA8072",
	sandybrown: "#F4A460",
	seagreen: "#2E8B57",
	seashell: "#FFF5EE",
	sienna: "#A0522D",
	silver: "#C0C0C0",
	skyblue: "#87CEEB",
	slateblue: "#6A5ACD",
	slategray: "#708090",
	slategrey: "#708090",
	snow: "#FFFAFA",
	springgreen: "#00FF7F",
	steelblue: "#4682B4",
	tan: "#D2B48C",
	teal: "#008080",
	thistle: "#D8BFD8",
	tomato: "#FF6347",
	turquoise: "#40E0D0",
	violet: "#EE82EE",
	wheat: "#F5DEB3",
	white: "#FFFFFF",
	whitesmoke: "#F5F5F5",
	yellow: "#FFFF00",
	yellowgreen: "#9ACD32",
	transparent: "rgba(0,0,0,0)",
};

export const parseCssColorName = (name) => {
	if (typeof name !== "string") return null;
	const lowerName = name.toLowerCase().replace(/\s+/g, "");
	if (cssColorNames[lowerName]) {
		if (lowerName === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
		return parseHex(cssColorNames[lowerName]);
	}
	return null;
};

export const updateAllFormatsFromRgb = (rgb) => {
	if (
		!rgb ||
		typeof rgb.r === "undefined" ||
		typeof rgb.g === "undefined" ||
		typeof rgb.b === "undefined" ||
		typeof rgb.a === "undefined"
	) {
		return { hex: "", rgb: "", rgba: "", hsl: "", hsla: "", hsv: "", hsb: "", currentRgb: null };
	}
	const hex = rgbToHex(rgb);
	const hsl = rgbToHsl(rgb);
	const hsv = rgbToHsv(rgb);
	const alphaFixed = parseFloat(rgb.a.toFixed(2));

	return {
		hex: hex,
		rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
		rgba: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alphaFixed})`,
		hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
		hsla: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alphaFixed})`,
		hsv: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
		hsb: `hsb(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
		currentRgb: rgb,
	};
};
