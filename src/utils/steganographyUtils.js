const MESSAGE_DELIMITER = "$$EOM$$";

const messageToBinary = (message) => {
	return (
		message
			.split("")
			.map((char) => {
				return char.charCodeAt(0).toString(2).padStart(8, "0");
			})
			.join("") +
		MESSAGE_DELIMITER.split("")
			.map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
			.join("")
	);
};

const modifyLSB = (number, bit) => {
	if (number % 2 === parseInt(bit, 10)) {
		return number;
	}
	return bit === "1" ? number + 1 : number - 1;
};

export const encodeMessageInImage = (ctx, width, height, message) => {
	const binaryMessage = messageToBinary(message);
	const messageLength = binaryMessage.length;

	const capacity = width * height * 3;
	if (messageLength > capacity) {
		throw new Error("Message is too long to be hidden in this image.");
	}

	const imageData = ctx.getImageData(0, 0, width, height);
	const data = imageData.data;
	let bitIndex = 0;

	for (let i = 0; i < data.length && bitIndex < messageLength; i += 4) {
		for (let j = 0; j < 3 && bitIndex < messageLength; j++) {
			const colorComponentIndex = i + j;
			const bit = binaryMessage[bitIndex];
			data[colorComponentIndex] = modifyLSB(data[colorComponentIndex], bit);
			bitIndex++;
		}
	}

	ctx.putImageData(imageData, 0, 0);
};

export const decodeMessageFromImage = (ctx, width, height) => {
	const imageData = ctx.getImageData(0, 0, width, height);
	const data = imageData.data;

	let binaryMessage = "";
	//let charCode = "";

	for (let i = 0; i < data.length; i += 4) {
		for (let j = 0; j < 3; j++) {
			const colorComponent = data[i + j];
			const lsb = (colorComponent % 2).toString();
			binaryMessage += lsb;

			if (binaryMessage.length % 8 === 0) {
				//charCode = String.fromCharCode(parseInt(binaryMessage.slice(-8), 2));
				const decodedString = binaryMessage
					.match(/.{1,8}/g)
					.map((byte) => String.fromCharCode(parseInt(byte, 2)))
					.join("");

				if (decodedString.endsWith(MESSAGE_DELIMITER)) {
					return decodedString.substring(0, decodedString.length - MESSAGE_DELIMITER.length);
				}
			}
		}
	}

	return null;
};
