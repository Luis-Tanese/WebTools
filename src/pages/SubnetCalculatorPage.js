import React, { useState, useCallback } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { useToast } from "../hooks/useToast";
import { calculateSubnetDetails, isValidIp, isValidMaskOrCidr } from "../utils/ipUtils";
import "../css/subnet-calculator.css";

const SubnetCalculatorPage = () => {
	const { t } = useTranslation();
	const { showToast } = useToast();
	const [ipAddress, setIpAddress] = useState("192.168.1.10");
	const [subnetMask, setSubnetMask] = useState("/24");
	const [results, setResults] = useState(null);

	const handleCalculate = useCallback(() => {
		setResults(null);

		if (!ipAddress.trim() || !subnetMask.trim()) {
			showToast(t("scErrorInvalidInput"), "error");
			return;
		}
		if (!isValidIp(ipAddress)) {
			showToast(t("scErrorInvalidIP"), "error");
			return;
		}
		if (!isValidMaskOrCidr(subnetMask)) {
			showToast(t("scErrorInvalidMask"), "error");
			return;
		}

		try {
			const details = calculateSubnetDetails(ipAddress, subnetMask);
			setResults(details);
		} catch (e) {
			showToast(e.message || t("scErrorInvalidInput"), "error");
			console.error("Calculation error:", e);
		}
	}, [ipAddress, subnetMask, t, showToast]);

	return (
		<div className="container sc-container">
			<header className="tool-header">
				<h1>{t("scPageTitle")}</h1>
				<p className="subtitle">{t("scPageSubtitle")}</p>
			</header>

			<main className="sc-main">
				<div className="sc-input-section">
					<div className="sc-input-group">
						<label htmlFor="ip-address">{t("scIpAddressLabel")}</label>
						<input
							type="text"
							id="ip-address"
							value={ipAddress}
							onChange={(e) => setIpAddress(e.target.value)}
							placeholder="e.g., 192.168.1.0"
						/>
					</div>
					<div className="sc-input-group">
						<label htmlFor="subnet-mask">{t("scSubnetMaskLabel")}</label>
						<input
							type="text"
							id="subnet-mask"
							value={subnetMask}
							onChange={(e) => setSubnetMask(e.target.value)}
							placeholder="e.g., 255.255.255.0 or /24"
						/>
					</div>
					<button onClick={handleCalculate} className="tool-btn sc-calculate-btn">
						<i className="fas fa-calculator"></i> {t("scCalculateButton")}
					</button>
				</div>

				{results && (
					<div className="sc-results-area">
						<h3>{t("scResultsHeader")}</h3>
						<ul className="sc-results-list">
							<li>
								<strong>{t("scNetworkAddress")}</strong> {results.networkAddress}
							</li>
							<li>
								<strong>{t("scBroadcastAddress")}</strong> {results.broadcastAddress}
							</li>
							<li>
								<strong>{t("scFirstUsableHost")}</strong> {results.firstUsableHost}
							</li>
							<li>
								<strong>{t("scLastUsableHost")}</strong> {results.lastUsableHost}
							</li>
							<li>
								<strong>{t("scUsableHosts")}</strong> {results.numUsableHosts}
							</li>
							<li>
								<strong>{t("scSubnetMaskDecimal")}</strong> {results.subnetMaskDecimal}
							</li>
							<li>
								<strong>{t("scSubnetMaskCIDR")}</strong> /{results.cidr}
							</li>
							<li>
								<strong>{t("scWildcardMask")}</strong> {results.wildcardMask}
							</li>
							<li>
								<strong>{t("scIpType")}</strong> {t(results.ipTypeKey)}
							</li>
							<li>
								<strong>{t("scIpClass")}</strong> {t(results.ipClassKey)}
							</li>
						</ul>
					</div>
				)}
			</main>
		</div>
	);
};

export default SubnetCalculatorPage;
