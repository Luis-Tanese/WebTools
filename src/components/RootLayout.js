import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";
import Footer from "./Footer";
import BackButton from "./BackButton";
import SuggestToolPopup from "./SuggestToolPopup";
import PageTransitionWrapper from "./PageTransitionWrapper";
import { useTranslation } from "../hooks/useTranslation";
import { usePageTransition } from "../hooks/usePageTransition";

const RootLayout = () => {
	const { t, language } = useTranslation();
	const location = useLocation();
	const { isTransitioning } = usePageTransition();

	useEffect(() => {
		if (location.pathname === "/") {
			document.title = t("pageTitle");
			let metaDescription = document.querySelector('meta[name="description"]');
			if (metaDescription) {
				metaDescription.setAttribute("content", t("homePageDescription") || t("defaultMetaDescription"));
			}
		}
		document.documentElement.lang = language.startsWith("pt") ? "pt-BR" : "en";
	}, [location.pathname, t, language]);

	const showBackButton = location.pathname !== "/";

	return (
		<>
			{showBackButton && <BackButton className={isTransitioning ? "slide-out-left" : ""} />}
			<LanguageSwitcher className={isTransitioning ? "slide-out-right" : ""} />
			<SuggestToolPopup className={isTransitioning ? "slide-out-bottom-right" : ""} />

			<PageTransitionWrapper>
				<div className="page-content-wrapper">
					<Outlet />
				</div>
			</PageTransitionWrapper>

			<Footer />
		</>
	);
};

export default RootLayout;
