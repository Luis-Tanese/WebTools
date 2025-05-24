const LOREM_WORDS = [
	"lorem",
	"ipsum",
	"dolor",
	"sit",
	"amet",
	"consectetur",
	"adipiscing",
	"elit",
	"curabitur",
	"vitae",
	"hendrerit",
	"pede",
	"vel",
	"dapibus",
	"ante",
	"vivamus",
	"nibh",
	"ligula",
	"elementum",
	"id",
	"cursus",
	"quis",
	"turpis",
	"nulla",
	"porttitor",
	"accumsan",
	"tincidunt",
	"praesent",
	"semper",
	"feugiat",
	"pellentesque",
	"commodo",
	"lectus",
	"aliquam",
	"erat",
	"volutpat",
	"ut",
	"pharetra",
	"augue",
	"nec",
	"laoreet",
	"rutrum",
	"tellus",
	"malesuada",
	"enim",
	"et",
	"tempus",
	"odio",
	"morbi",
	"quis",
	"urna",
	"libero",
	"ultrices",
	"nisl",
	"nam",
	"eget",
	"dui",
	"etiam",
	"rhoncus",
	"maecenas",
	"tempus",
	"tellus",
	"condimentum",
	"sem",
	"a",
	"quam",
	"semper",
	"libero",
	"sit",
	"amet",
	"adipiscing",
	"sem",
	"neque",
	"sed",
	"ipsum",
	"nam",
	"quam",
	"nunc",
	"blandit",
	"vel",
	"luctus",
	"pulvinar",
	"hendrerit",
	"id",
	"lorem",
	"maecenas",
	"nec",
	"odio",
	"et",
	"ante",
	"tincidunt",
	"tempus",
	"donec",
	"vitae",
	"sapien",
	"ut",
	"libero",
	"venenatis",
	"faucibus",
	"nullam",
	"quis",
	"ante",
	"etiam",
	"sit",
	"amet",
	"orci",
	"eget",
	"eros",
	"faucibus",
	"tincidunt",
	"dui",
	"leo",
	"egestas",
	"nulla",
	"vitae",
	"placerat",
	"purus",
	"lobortis",
	"mauris",
	"phasellus",
	"pulvinar",
	"lacus",
	"quis",
	"eros",
	"donec",
	"nibh",
	"urna",
	"mollis",
	"neque",
	"suspendisse",
	"potenti",
	"nullam",
	"ac",
	"tortor",
	"vitae",
	"purus",
	"faucibus",
	"ornare",
	"suspendisse",
	"potenti",
	"nunc",
	"feugiat",
	"mi",
	"a",
	"tellus",
	"phasellus",
	"viverra",
	"nulla",
	"ut",
	"metus",
	"varius",
	"laoreet",
	"quisque",
	"rutrum",
	"aenean",
	"imperdiet",
	"etiam",
	"ultricies",
	"nisi",
	"vel",
	"augue",
	"curabitur",
	"ullamcorper",
	"ultricies",
	"nisi",
	"nam",
	"eget",
	"dui",
	"etiam",
	"rhoncus",
	"maecenas",
	"tempus",
	"tellus",
	"eget",
	"condimentum",
	"rhoncus",
	"sem",
	"quam",
	"semper",
	"libero",
	"sit",
	"amet",
	"adipiscing",
	"sem",
	"neque",
	"sed",
	"ipsum",
];

const CLASSIC_START = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ";

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSentence(wordCount) {
	let sentence = "";
	for (let i = 0; i < wordCount; i++) {
		sentence += LOREM_WORDS[getRandomInt(0, LOREM_WORDS.length - 1)] + " ";
	}
	sentence = sentence.trim();
	return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
}

function generateParagraph(sentenceCount, startWithClassic = false) {
	let paragraph = startWithClassic ? CLASSIC_START : "";
	const initialSentenceCount = startWithClassic ? sentenceCount - 1 : sentenceCount;

	for (let i = 0; i < initialSentenceCount; i++) {
		paragraph += generateSentence(getRandomInt(5, 15)) + " ";
	}
	return paragraph.trim();
}

export const generateLoremIpsum = (options) => {
	const { type = "paragraphs", amount = 1, startWithClassic = false } = options;
	let result = "";

	switch (type) {
		case "paragraphs":
			for (let i = 0; i < amount; i++) {
				result +=
					generateParagraph(getRandomInt(3, 7), i === 0 && startWithClassic) + (i < amount - 1 ? "\n\n" : "");
			}
			break;
		case "words":
			let wordsArray = [];
			if (startWithClassic) {
				wordsArray = CLASSIC_START.toLowerCase()
					.replace(/[.,]/g, "")
					.split(/\s+/)
					.filter((w) => w.length > 0);
			}
			const remainingWords = amount - wordsArray.length;
			for (let i = 0; i < remainingWords; i++) {
				wordsArray.push(LOREM_WORDS[getRandomInt(0, LOREM_WORDS.length - 1)]);
			}
			if (wordsArray.length > amount) wordsArray = wordsArray.slice(0, amount);
			result = wordsArray.join(" ");
			if (result.length > 0) result = result.charAt(0).toUpperCase() + result.slice(1) + ".";
			break;
		case "bytes":
			let currentBytes = 0;
			let tempResult = "";
			if (startWithClassic) {
				tempResult = CLASSIC_START;
				currentBytes = new TextEncoder().encode(tempResult).length;
			}
			while (currentBytes < amount) {
				const word = LOREM_WORDS[getRandomInt(0, LOREM_WORDS.length - 1)] + " ";
				const wordBytes = new TextEncoder().encode(word).length;
				if (currentBytes + wordBytes > amount) {
					for (let char of word) {
						const charByte = new TextEncoder().encode(char).length;
						if (currentBytes + charByte <= amount) {
							tempResult += char;
							currentBytes += charByte;
						} else {
							break;
						}
					}
					break;
				}
				tempResult += word;
				currentBytes += wordBytes;
			}
			result = tempResult.trim();
			if (result.length > 0 && !result.endsWith(".")) result += ".";
			break;
		case "list":
			const listItems = [];
			for (let i = 0; i < amount; i++) {
				let itemText = generateSentence(getRandomInt(4, 10));
				if (i === 0 && startWithClassic) {
					itemText = CLASSIC_START.trim().replace(/\.$/, "") + ", " + itemText.toLowerCase();
					itemText = itemText.charAt(0).toUpperCase() + itemText.slice(1);
				}
				listItems.push(`<li>${itemText}</li>`);
			}
			result = `<ul>\n${listItems.join("\n")}\n</ul>`;
			break;
		default:
			result = "Invalid type specified.";
	}
	return result;
};
