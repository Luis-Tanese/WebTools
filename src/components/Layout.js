import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";
import { getClientId } from "../utils/clientId";

const API_BASE_URL = "https://web-tools-server.vercel.app";

const Layout = ({ pageTitleKey, pageDescriptionKey }) => {
	const { t, language } = useTranslation();
	const location = useLocation();

	useEffect(() => {
		const title = t(pageTitleKey) || "WebTools";
		document.title = title;

		const descriptionContent = t(pageDescriptionKey) || t("defaultMetaDescription");
		let metaDescription = document.querySelector('meta[name="description"]');
		if (metaDescription) {
			metaDescription.setAttribute("content", descriptionContent);
		} else {
			metaDescription = document.createElement("meta");
			metaDescription.name = "description";
			metaDescription.content = descriptionContent;
			document.getElementsByTagName("head")[0].appendChild(metaDescription);
		}

		document.documentElement.lang = language.startsWith("pt") ? "pt-BR" : "en";
	}, [t, pageTitleKey, pageDescriptionKey, location.pathname, language]);

	useEffect(() => {
		const recordVisit = async () => {
			if (location.pathname.startsWith("/tools/")) {
				const hasVisitedInSession = sessionStorage.getItem(`visited_${location.pathname}`);
				if (!hasVisitedInSession) {
					const clientId = getClientId();
					try {
						await fetch(`${API_BASE_URL}/api/tools/visit`, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ clientId, toolId: location.pathname }),
						});
						sessionStorage.setItem(`visited_${location.pathname}`, "true");
					} catch (error) {
						console.error("Failed to record visit:", error);
					}
				}
			}
		};
		recordVisit();
	}, [location.pathname]);

	return <Outlet />;
};

export default Layout;
