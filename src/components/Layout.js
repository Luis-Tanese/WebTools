import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";

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

	return <Outlet />;
};

export default Layout;
