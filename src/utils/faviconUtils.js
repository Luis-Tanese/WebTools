import JSZip from "jszip";

export const FAVICON_SIZES = [
	{ name: "favicon-16x16.png", size: 16, labelKey: "fgFaviconSize16" },
	{ name: "favicon-32x32.png", size: 32, labelKey: "fgFaviconSizeDefault" },
	{ name: "favicon-48x48.png", size: 48, labelKey: "fgFaviconSize48" },
	{ name: "apple-touch-icon.png", size: 180, labelKey: "fgAppleTouchIcon" },
	{ name: "android-chrome-192x192.png", size: 192, labelKey: "fgAndroidChrome192" },
	{ name: "android-chrome-512x512.png", size: 512, labelKey: "fgAndroidChrome512" },
];

export const resizeImage = (imageFile, targetWidth, targetHeight, outputType = "image/png") => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (event) => {
			const img = new Image();
			img.onload = () => {
				const canvas = document.createElement("canvas");
				canvas.width = targetWidth;
				canvas.height = targetHeight;
				const ctx = canvas.getContext("2d");

				if (outputType === "image/png" && imageFile.type !== "image/jpeg") {
					ctx.clearRect(0, 0, targetWidth, targetHeight);
				} else {
					ctx.fillStyle = "#FFFFFF";
					ctx.fillRect(0, 0, targetWidth, targetHeight);
				}

				const sourceWidth = img.width;
				const sourceHeight = img.height;
				const sourceAspectRatio = sourceWidth / sourceHeight;
				const targetAspectRatio = targetWidth / targetHeight;

				let drawWidth, drawHeight, offsetX, offsetY;

				if (sourceAspectRatio > targetAspectRatio) {
					drawHeight = sourceHeight;
					drawWidth = sourceHeight * targetAspectRatio;
					offsetX = (sourceWidth - drawWidth) / 2;
					offsetY = 0;
				} else {
					drawWidth = sourceWidth;
					drawHeight = sourceWidth / targetAspectRatio;
					offsetY = (sourceHeight - drawHeight) / 2;
					offsetX = 0;
				}

				ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight, 0, 0, targetWidth, targetHeight);

				canvas.toBlob(
					(blob) => {
						if (blob) {
							resolve(blob);
						} else {
							reject(new Error("Canvas toBlob failed"));
						}
					},
					outputType,
					0.95
				);
			};
			img.onerror = () => reject(new Error("Image loading failed"));
			img.src = event.target.result;
		};
		reader.onerror = () => reject(new Error("File reading failed"));
		reader.readAsDataURL(imageFile);
	});
};

export const generateManifestJson = (appName, themeColor) => {
	const manifest = {
		name: appName || "My Awesome App",
		short_name: appName ? appName.substring(0, 12) : "App",
		icons: [
			{
				src: "/android-chrome-192x192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/android-chrome-512x512.png",
				sizes: "512x512",
				type: "image/png",
			},
		],
		theme_color: themeColor || "#ffffff",
		background_color: themeColor || "#ffffff",
		display: "standalone",
	};
	return JSON.stringify(manifest, null, 2);
};

export const generateHtmlCode = (themeColor) => {
	let html = `
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;

	if (themeColor) {
		html += `
<meta name="theme-color" content="${themeColor}">`;
	}
	return html.trim();
};

export const createZip = async (generatedFiles) => {
	const zip = new JSZip();
	for (const file of generatedFiles) {
		if (file.blob) {
			zip.file(file.name, file.blob);
		} else if (file.content) {
			zip.file(file.name, file.content);
		}
	}
	const blob = await zip.generateAsync({ type: "blob" });
	return blob;
};
