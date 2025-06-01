const { overrideDevServer } = require("customize-cra");

const devServerConfig = () => (config) => {
	return {
		...config,
		headers: {
			"Cross-Origin-Opener-Policy": "same-origin",
			"Cross-Origin-Embedder-Policy": "require-corp",
		},
	};
};

module.exports = {
	devServer: overrideDevServer(devServerConfig()),
};
