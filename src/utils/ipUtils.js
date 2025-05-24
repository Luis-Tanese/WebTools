const ipToLong = (ip) => {
	return ip.split(".").reduce((acc, octet, index) => acc + (parseInt(octet) << (24 - index * 8)), 0) >>> 0;
};

const longToIp = (long) => {
	return [(long >>> 24) & 255, (long >>> 16) & 255, (long >>> 8) & 255, long & 255].join(".");
};

const cidrToMaskLong = (cidr) => {
	return cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
};

const maskLongToCidr = (maskLong) => {
	let cidr = 0;
	let tempMask = maskLong;
	while (tempMask & 0x80000000) {
		cidr++;
		tempMask <<= 1;
	}
	if ((tempMask & 0xffffffff) !== 0 && maskLong !== 0) {
		for (let i = 0; i < 32 - cidr; i++) {
			if ((maskLong & (1 << i)) !== 0) throw new Error("Invalid subnet mask: not contiguous.");
		}
	}
	return cidr;
};

export const isValidIp = (ip) => {
	const ipRegex =
		/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
	return ipRegex.test(ip);
};

export const isValidMaskOrCidr = (maskOrCidr) => {
	if (maskOrCidr.startsWith("/")) {
		const cidr = parseInt(maskOrCidr.substring(1));
		return !isNaN(cidr) && cidr >= 0 && cidr <= 32;
	} else {
		if (!isValidIp(maskOrCidr)) return false;
		try {
			maskLongToCidr(ipToLong(maskOrCidr));
			return true;
		} catch {
			return false;
		}
	}
};

const getIpTypeAndClass = (ipLong) => {
	const firstOctet = (ipLong >>> 24) & 255;
	let ipTypeKey = "scPublicNetwork";
	let ipClassKey = "";

	if (firstOctet === 10) ipTypeKey = "scPrivateNetwork"; // 10.0.0.0 - 10.255.255.255
	if (firstOctet === 172 && ((ipLong >>> 16) & 0xff) >= 16 && ((ipLong >>> 16) & 0xff) <= 31)
		ipTypeKey = "scPrivateNetwork"; // 172.16.0.0 - 172.31.255.255
	if (firstOctet === 192 && ((ipLong >>> 16) & 0xff) === 168) ipTypeKey = "scPrivateNetwork"; // 192.168.0.0 - 192.168.255.255

	if (firstOctet === 127) ipTypeKey = "scLoopbackNetwork"; // 127.0.0.0 - 127.255.255.255

	if (firstOctet === 169 && ((ipLong >>> 16) & 0xff) === 254) ipTypeKey = "scLinkLocalNetwork"; // 169.254.0.0 - 169.254.255.255

	if (firstOctet >= 1 && firstOctet <= 126) ipClassKey = "scClassA";
	else if (firstOctet >= 128 && firstOctet <= 191) ipClassKey = "scClassB";
	else if (firstOctet >= 192 && firstOctet <= 223) ipClassKey = "scClassC";
	else if (firstOctet >= 224 && firstOctet <= 239) ipClassKey = "scClassD";
	else if (firstOctet >= 240 && firstOctet <= 255) ipClassKey = "scClassE";

	return { ipTypeKey, ipClassKey };
};

export const calculateSubnetDetails = (ipStr, maskOrCidrStr) => {
	const ipLong = ipToLong(ipStr);
	let maskLong;
	let cidr;

	if (maskOrCidrStr.startsWith("/")) {
		cidr = parseInt(maskOrCidrStr.substring(1));
		if (isNaN(cidr) || cidr < 0 || cidr > 32) throw new Error("Invalid CIDR value.");
		maskLong = cidrToMaskLong(cidr);
	} else {
		if (!isValidIp(maskOrCidrStr)) throw new Error("Invalid subnet mask format.");
		maskLong = ipToLong(maskOrCidrStr);
		cidr = maskLongToCidr(maskLong);
	}

	const networkAddressLong = (ipLong & maskLong) >>> 0;
	const wildcardMaskLong = ~maskLong >>> 0;
	const broadcastAddressLong = (networkAddressLong | wildcardMaskLong) >>> 0;

	const hostBits = 32 - cidr;
	const numTotalHosts = hostBits > 0 ? Math.pow(2, hostBits) : 0;
	const numUsableHosts = hostBits > 1 ? numTotalHosts - 2 : hostBits === 1 ? 0 : 0;

	const firstUsableHostLong = hostBits > 1 ? networkAddressLong + 1 : networkAddressLong;
	const lastUsableHostLong = hostBits > 1 ? broadcastAddressLong - 1 : broadcastAddressLong;

	const { ipTypeKey, ipClassKey } = getIpTypeAndClass(ipLong);

	return {
		ipAddress: ipStr,
		subnetMaskDecimal: longToIp(maskLong),
		cidr: cidr,
		networkAddress: longToIp(networkAddressLong),
		broadcastAddress: longToIp(broadcastAddressLong),
		firstUsableHost: hostBits > 1 ? longToIp(firstUsableHostLong) : "N/A",
		lastUsableHost: hostBits > 1 ? longToIp(lastUsableHostLong) : "N/A",
		numUsableHosts: numUsableHosts,
		wildcardMask: longToIp(wildcardMaskLong),
		ipTypeKey: ipTypeKey,
		ipClassKey: ipClassKey,
	};
};
