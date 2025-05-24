import CryptoJS from "crypto-js";

function bufferToHex(buffer) {
	return Array.from(new Uint8Array(buffer))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

export const HASH_ALGORITHMS = {
	MD5: { name: "MD5", cryptoJs: true },
	"SHA-1": { name: "SHA-1", subtleName: "SHA-1" },
	"SHA-256": { name: "SHA-256", subtleName: "SHA-256" },
	"SHA-384": { name: "SHA-384", subtleName: "SHA-384" },
	"SHA-512": { name: "SHA-512", subtleName: "SHA-512" },
};

export const generateHashForText = async (text, algorithmKey) => {
	const algorithm = HASH_ALGORITHMS[algorithmKey];
	if (!algorithm) throw new Error("Invalid algorithm selected");

	if (algorithm.cryptoJs) {
		if (algorithm.name === "MD5") {
			return CryptoJS.MD5(text).toString(CryptoJS.enc.Hex);
		}
	} else if (algorithm.subtleName) {
		const encoder = new TextEncoder();
		const data = encoder.encode(text);
		const hashBuffer = await crypto.subtle.digest(algorithm.subtleName, data);
		return bufferToHex(hashBuffer);
	}
	throw new Error("Algorithm not implemented");
};

export const generateHashForFile = (file, algorithmKey) => {
	return new Promise((resolve, reject) => {
		const algorithm = HASH_ALGORITHMS[algorithmKey];
		if (!algorithm) {
			reject(new Error("Invalid algorithm selected"));
			return;
		}

		const reader = new FileReader();
		reader.onload = async (e) => {
			try {
				const arrayBuffer = e.target.result;
				if (algorithm.cryptoJs) {
					if (algorithm.name === "MD5") {
						const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
						resolve(CryptoJS.MD5(wordArray).toString(CryptoJS.enc.Hex));
					}
				} else if (algorithm.subtleName) {
					const hashBuffer = await crypto.subtle.digest(algorithm.subtleName, arrayBuffer);
					resolve(bufferToHex(hashBuffer));
				} else {
					reject(new Error("Algorithm not implemented for file hashing"));
				}
			} catch (error) {
				reject(error);
			}
		};
		reader.onerror = () => {
			reject(new Error("Error reading file"));
		};
		reader.readAsArrayBuffer(file);
	});
};
