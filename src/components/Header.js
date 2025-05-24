import React from "react";
import { useTranslation } from "../hooks/useTranslation";

const Header = ({ onSearch }) => {
	const { t } = useTranslation();

	return (
		<header>
			<h1>{t("pageTitle")}</h1>
			<p className="subtitle">{t("pageSubtitle")}</p>
			<div className="search-container">
				<input type="search" id="search-bar" placeholder={t("searchPlaceholder")} onChange={onSearch} />
			</div>
		</header>
	);
};

export default Header;
