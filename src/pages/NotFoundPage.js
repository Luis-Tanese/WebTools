import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";
import LanguageSwitcher from "../components/LanguageSwitcher";
import Footer from "../components/Footer";
import "../css/not-found-page.css";

const NotFoundPage = () => {
	const { t, language } = useTranslation();

	React.useEffect(() => {
		document.title = t("notFoundPageTitle") + " | WebTools";

		const descriptionContent = t("notFoundPageDescription") || t("defaultMetaDescription");
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
	}, [t, language]);

	return (
		<>
			<LanguageSwitcher />
			<div className="page-content-wrapper">
				<div className="container nf-container">
					<div className="nf-icon">
						<i className="fas fa-ghost"></i>
					</div>
					<h1 className="nf-title">{t("notFoundTitle")}</h1>
					<p className="nf-message">{t("notFoundMessage")}</p>
					<Link to="/" className="nf-home-button">
						<i className="fas fa-home"></i> {t("notFoundGoHome")}
					</Link>
				</div>
			</div>
			<Footer />
		</>
	);
};

export default NotFoundPage;
