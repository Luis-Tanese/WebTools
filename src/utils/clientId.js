export const getClientId = () => {
	let clientId = localStorage.getItem("webtools_clientId");
	if (!clientId) {
		clientId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
		localStorage.setItem("webtools_clientId", clientId);
	}
	return clientId;
};
