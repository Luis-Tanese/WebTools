import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";
import Footer from "./Footer";
import BackButton from "./BackButton";
import { useTranslation } from "../hooks/useTranslation";
import SuggestToolPopup from "./SuggestToolPopup";

const Layout = ({ pageTitleKey, pageDescriptionKey, isToolPage = true }) => {
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

	return (
		<>
            {isToolPage && <BackButton />}
            <LanguageSwitcher />
            <div className="page-content-wrapper">
                <Outlet />
            </div>
            <SuggestToolPopup /> 
            <Footer />
        </>
	);
};

export default Layout;
